/* Shared, user-selected community; no GPS or precise location is collected. */
window.BambooLocation=(()=>{
 const areas=[['san-diego-county','San Diego County'],['north-park','North Park'],['city-heights','City Heights'],['chula-vista','Chula Vista'],['la-jolla','La Jolla'],['oceanside','Oceanside'],['encinitas','Encinitas'],['los-angeles','Los Angeles'],['san-francisco','San Francisco']];
 const key='bamboo-community-location-v1';const valid=value=>areas.some(([id])=>id===value);let selected='san-diego-county';
 function read(){try{const value=localStorage.getItem(key);selected=valid(value)?value:'san-diego-county';}catch{}}read();
 function name(id=selected){return areas.find(([value])=>value===id)?.[1]||'San Diego County';}
 function options(){return areas.map(([id,label])=>`<option value="${id}"${selected===id?' selected':''}>${label}</option>`).join('');}
 function set(value){if(!valid(value))return false;selected=value;let saved=true;try{localStorage.setItem(key,value);}catch{saved=false;}window.dispatchEvent(new Event('bamboo-location-change'));return saved;}
 function render(){return `<div class="account-settings"><div class="settings-heading"><button class="button settings-back" data-action="settings" aria-label="Back to settings">←</button><h1>Your community</h1></div><section class="panel stack"><label for="account-community">Location</label><select id="account-community">${options()}</select><p class="small">The community canvas shows opted-in members with at least a 15-day streak in this area. San Diego County includes all demo neighborhoods.</p><p class="small" id="community-save-status" role="status">Saved on this device. No GPS is used.</p><button class="button" data-action="wall">Open your community wallpaper →</button></section></div>`;}
 document.addEventListener('change',event=>{if(event.target.id!=='account-community')return;const saved=set(event.target.value);document.getElementById('community-save-status').textContent=saved?'Community saved. Your canvas now follows this location.':'Location applied for this visit; device storage is unavailable.';});
 window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;read();window.dispatchEvent(new Event('bamboo-location-change'));});
 window.addEventListener('bamboo-location-change',()=>{const select=document.getElementById('account-community');if(select)select.value=selected;const label=document.getElementById('city-label');if(label)label.textContent=name();});
 return {areas,key,get current(){return selected;},name,options,set,render};
})();
