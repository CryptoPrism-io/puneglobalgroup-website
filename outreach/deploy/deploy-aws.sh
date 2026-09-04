#!/usr/bin/env bash
set -Eeuo pipefail

IMAGE="${1:?usage: pgg-outreach-deploy <ecr-image>}"
IMAGE="${IMAGE#\'}"; IMAGE="${IMAGE%\'}"
IMAGE="${IMAGE#\"}"; IMAGE="${IMAGE%\"}"
APP_DIR=/opt/pgg-outreach
COMPOSE=(docker compose --env-file .env.aws -f docker-compose.aws.yml)

case "$IMAGE" in
  405633560616.dkr.ecr.ap-south-1.amazonaws.com/pgg-outreach:*) ;;
  *) echo "Refusing unexpected image: $IMAGE" >&2; exit 2 ;;
esac

exec 9>/var/lock/pgg-outreach-deploy.lock
flock -n 9 || { echo "Another outreach deployment is running" >&2; exit 3; }

cd "$APP_DIR"
PREVIOUS_IMAGE="$(sed -n 's/^CRM_IMAGE=//p' .env.aws)"
PREVIOUS_IMAGE="${PREVIOUS_IMAGE#\'}"; PREVIOUS_IMAGE="${PREVIOUS_IMAGE%\'}"
PREVIOUS_IMAGE="${PREVIOUS_IMAGE#\"}"; PREVIOUS_IMAGE="${PREVIOUS_IMAGE%\"}"
ENV_CHANGED=0

rollback_image() {
  status=$?
  if [ "$status" -ne 0 ] && [ "$ENV_CHANGED" -eq 1 ] && [ -n "$PREVIOUS_IMAGE" ]; then
    sed -i "s#^CRM_IMAGE=.*#CRM_IMAGE=$PREVIOUS_IMAGE#" .env.aws
    "${COMPOSE[@]}" up -d --force-recreate crm || true
  fi
  exit "$status"
}
trap rollback_image EXIT

/usr/local/bin/pgg-outreach-backup
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 405633560616.dkr.ecr.ap-south-1.amazonaws.com

sed -i "s#^CRM_IMAGE=.*#CRM_IMAGE=$IMAGE#" .env.aws
ENV_CHANGED=1
"${COMPOSE[@]}" pull crm
docker logout 405633560616.dkr.ecr.ap-south-1.amazonaws.com >/dev/null 2>&1 || true
"${COMPOSE[@]}" run --rm --no-deps crm npx prisma migrate deploy
"${COMPOSE[@]}" up -d --force-recreate crm

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3001/health >/dev/null; then
    ENV_CHANGED=0
    trap - EXIT
    echo "Deployed $IMAGE"
    exit 0
  fi
  sleep 2
done

"${COMPOSE[@]}" logs --tail=100 crm >&2
echo "CRM health check failed" >&2
exit 1
