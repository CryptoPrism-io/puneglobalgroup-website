#!/bin/bash
set -euo pipefail

REGION=ap-south-1
BUCKET=pgg-outreach-backups-405633560616-ap-south-1
PARAMETER_NAME=/pgg/outreach/runtime
APP_DIR=/opt/pgg-outreach

timedatectl set-timezone Asia/Kolkata
dnf install -y docker jq cronie
systemctl enable --now docker crond amazon-ssm-agent
mkdir -p /usr/local/lib/docker/cli-plugins "$APP_DIR/deploy"
curl -fsSL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

aws s3 cp "s3://$BUCKET/deploy/docker-compose.aws.yml" "$APP_DIR/docker-compose.aws.yml" --region "$REGION"
aws s3 cp "s3://$BUCKET/deploy/init-databases.sql" "$APP_DIR/deploy/init-databases.sql" --region "$REGION"
aws ssm get-parameter --name "$PARAMETER_NAME" --with-decryption --region "$REGION" --query Parameter.Value --output text |
  jq -r 'to_entries[] | "\(.key)=\(.value|tostring|@sh)"' > "$APP_DIR/.env.aws"
chmod 600 "$APP_DIR/.env.aws"

cd "$APP_DIR"
REGISTRY="$(sed -n "s/^CRM_IMAGE='\([^/]*\).*/\1/p" .env.aws)"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker compose --env-file .env.aws -f docker-compose.aws.yml pull
docker compose --env-file .env.aws -f docker-compose.aws.yml up -d postgres

until docker compose --env-file .env.aws -f docker-compose.aws.yml exec -T postgres pg_isready -U appuser -d outreach; do
  sleep 3
done

if [ ! -f .data-restored ]; then
  aws s3 cp "s3://$BUCKET/initial/outreach.dump" /tmp/outreach.dump --region "$REGION"
  aws s3 cp "s3://$BUCKET/initial/outreach_demo.dump" /tmp/outreach_demo.dump --region "$REGION"
  cat /tmp/outreach.dump | docker compose --env-file .env.aws -f docker-compose.aws.yml exec -T postgres pg_restore --exit-on-error --no-owner --no-privileges -U appuser -d outreach
  cat /tmp/outreach_demo.dump | docker compose --env-file .env.aws -f docker-compose.aws.yml exec -T postgres pg_restore --exit-on-error --no-owner --no-privileges -U appuser -d outreach_demo
  rm -f /tmp/outreach.dump /tmp/outreach_demo.dump
  touch .data-restored
fi

docker compose --env-file .env.aws -f docker-compose.aws.yml up -d

cat > /usr/local/bin/pgg-outreach-backup <<'BACKUP'
#!/bin/bash
set -euo pipefail
cd /opt/pgg-outreach
STAMP="$(date +%Y-%m-%d_%H%M%S)"
COMPOSE=(docker compose --env-file .env.aws -f docker-compose.aws.yml)
"${COMPOSE[@]}" exec -T postgres pg_dump -Fc --no-owner --no-privileges -U appuser outreach |
  aws s3 cp - "s3://pgg-outreach-backups-405633560616-ap-south-1/daily/outreach-$STAMP.dump" --region ap-south-1
"${COMPOSE[@]}" exec -T postgres pg_dump -Fc --no-owner --no-privileges -U appuser outreach_demo |
  aws s3 cp - "s3://pgg-outreach-backups-405633560616-ap-south-1/daily/outreach_demo-$STAMP.dump" --region ap-south-1
BACKUP
chmod 700 /usr/local/bin/pgg-outreach-backup
echo '15 2 * * * root /usr/local/bin/pgg-outreach-backup >> /var/log/pgg-outreach-backup.log 2>&1' > /etc/cron.d/pgg-outreach-backup
