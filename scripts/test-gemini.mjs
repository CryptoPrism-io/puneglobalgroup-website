const key = 'AIzaSyDIxpNqLTm_lEFiDyHvYiz-ba3GeK4vhbc';
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
const d = await res.json();
const imgModels = d.models?.filter(m => m.name.includes('imagen') || m.name.includes('image') || m.name.includes('flash')) ?? [];
imgModels.forEach(m => console.log(m.name, '-', m.displayName));
