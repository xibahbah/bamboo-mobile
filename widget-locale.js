/* Shared widget/quote preference. Translations are editorial drafts, not official Tzu Chi editions. */
(() => {
 const fields=['name','quote','author','moment','back','opening','continue','unit','fresh','done','pending','hint','open'];
 const rows={
 'en-US':['English','A willing heart brings blessings.\nA sincere vow brings strength.','Master Cheng Yen · Jing Si Aphorisms','A moment of stillness','Back to widget','Opening Bamboo…','Continue to Bamboo →','day streak','A fresh start is always here.','A little good, done today.','A little room for kindness today.','Tap your bamboo to come back to a little good.','Open Bamboo'],
 'es-MX':['Español (México)','Un corazón dispuesto trae bendiciones.\nUn propósito sincero da fuerza.','Maestra Cheng Yen · Reflexiones Jing Si','Un momento de calma','Volver al widget','Abriendo Bamboo…','Continuar a Bamboo →','días seguidos','Siempre puedes volver a empezar.','Hoy hiciste algo bueno.','Hoy hay espacio para un poco de bondad.','Toca tu bambú para volver a hacer el bien.','Abrir Bamboo'],
 'zh-Hant':['繁體中文（國語）','有心就有福，\n有願就有力。','證嚴法師 · 靜思語','片刻靜心','返回小工具','正在開啟 Bamboo…','進入 Bamboo →','天連續','隨時都能重新開始。','今天的善意，已完成。','今天，留一點空間給善意。','輕點竹子，延續一點善意。','開啟 Bamboo'],
 'zh-Hans':['简体中文（普通话）','有心就有福，\n有愿就有力。','证严法师 · 静思语','片刻静心','返回小组件','正在打开 Bamboo…','进入 Bamboo →','天连续','随时都能重新开始。','今天的善意，已完成。','今天，留一点空间给善意。','轻点竹子，延续一点善意。','打开 Bamboo'],
 'fil-PH':['Filipino / Tagalog','Ang pusong handang magbigay ay nagdudulot ng biyaya.\nAng tapat na panata ay nagbibigay ng lakas.','Master Cheng Yen · Mga Kasabihang Jing Si','Sandali ng katahimikan','Bumalik sa widget','Binubuksan ang Bamboo…','Magpatuloy sa Bamboo →','sunod-sunod na araw','Maaari kang magsimulang muli.','May kabutihang nagawa ngayong araw.','May puwang para sa kabutihan ngayon.','Pindutin ang iyong kawayan para muling gumawa ng mabuti.','Buksan ang Bamboo'],
 'vi-VN':['Tiếng Việt','Có tâm thì có phước,\ncó nguyện thì có sức mạnh.','Pháp sư Chứng Nghiêm · Tĩnh Tư Ngữ','Một phút tĩnh tâm','Trở lại tiện ích','Đang mở Bamboo…','Tiếp tục vào Bamboo →','ngày liên tiếp','Luôn có thể bắt đầu lại.','Hôm nay đã làm một việc tốt.','Hôm nay vẫn còn chỗ cho lòng tốt.','Chạm vào cây tre để tiếp nối một việc tốt.','Mở Bamboo'],
 'ko-KR':['한국어','마음을 내면 복이 오고,\n서원을 세우면 힘이 생깁니다.','증엄 법사 · 정사어','잠시 마음을 고요히','위젯으로 돌아가기','Bamboo 여는 중…','Bamboo로 이동 →','일 연속','언제든 다시 시작할 수 있어요.','오늘의 작은 선행을 마쳤어요.','오늘도 작은 선행을 위한 여유를.','대나무를 눌러 작은 선행을 이어 가세요.','Bamboo 열기'],
 'ar':['العربية','القلب الراغب في الخير يجلب البركة.\nوالعزم الصادق يمنح القوة.','المعلّمة تشنغ ين · حكم جينغ سي','لحظة سكينة','العودة إلى الأداة','جارٍ فتح Bamboo…','المتابعة إلى Bamboo ←','أيام متتالية','يمكنك دائمًا البدء من جديد.','اكتمل عمل الخير اليوم.','ما زال هناك متسع للخير اليوم.','اضغط على الخيزران لمواصلة عمل الخير.','فتح Bamboo'],
 'fa':['فارسی','دلی مشتاق به نیکی، برکت می‌آورد.\nعهدی صادقانه، نیرو می‌بخشد.','استاد چنگ ین · سخنان جینگ سی','لحظه‌ای آرامش','بازگشت به ابزارک','در حال باز کردن Bamboo…','ادامه به Bamboo ←','روز پیاپی','همیشه می‌توان دوباره آغاز کرد.','کار نیک امروز انجام شد.','امروز هم فرصتی برای مهربانی هست.','برای ادامهٔ کار نیک، بامبو را لمس کنید.','باز کردن Bamboo'],
 'so-SO':['Soomaali','Qalbi diyaar u ah wanaaggu wuxuu keenaa barako.\nBallan daacad ahna wuxuu keenaa xoog.','Macallimad Cheng Yen · Oraahyada Jing Si','Daqiiqad degganaan ah','Ku noqo widget-ka','Bamboo waa la furayaa…','U gudub Bamboo →','maalmood oo xiriir ah','Mar walba dib ayaad u bilaabi kartaa.','Wanaaggii maanta waa la qabtay.','Maanta weli fursad ayaa jirta in wanaag la sameeyo.','Taabo bamboogaaga si aad wanaagga u sii waddo.','Fur Bamboo']
 };
 const catalog=Object.fromEntries(Object.entries(rows).map(([code,row])=>[code,Object.fromEntries(fields.map((field,i)=>[field,row[i]]))]));
 const key='bamboo-language-v1';let choice='auto';
 try{const saved=localStorage.getItem(key);if(saved==='auto'||Object.hasOwn(catalog,saved))choice=saved;}catch{}
 function match(tag){
  const value=String(tag).toLowerCase();
  if(/^zh(?:-|$)/.test(value))return /(?:hant|tw|hk|mo)/.test(value)?'zh-Hant':'zh-Hans';
  const base=value.split('-')[0];
  return {'en':'en-US','es':'es-MX','fil':'fil-PH','tl':'fil-PH','vi':'vi-VN','ko':'ko-KR','ar':'ar','fa':'fa','so':'so-SO'}[base];
 }
 function current(){return choice==='auto'?(Array.from(navigator.languages||[navigator.language||'en-US']).map(match).find(Boolean)||'en-US'):choice;}
 window.BambooLocale={catalog,key,get choice(){return choice;},current,
  text(){return catalog[current()];},
  set(value){if(value!=='auto'&&!Object.hasOwn(catalog,value))return false;choice=value;let saved=true;try{localStorage.setItem(key,value);}catch{saved=false;}window.dispatchEvent(new Event('bamboo-language-change'));return saved;},
  options(){return `<option value="auto"${choice==='auto'?' selected':''}>Device language / 語言 / Idioma</option>`+Object.entries(catalog).map(([code,t])=>`<option value="${code}"${choice===code?' selected':''}>${t.name}</option>`).join('');}
 };
 window.addEventListener('storage',event=>{if(event.key===key||event.key===null){choice=event.newValue==='auto'||Object.hasOwn(catalog,event.newValue)?event.newValue:'auto';window.dispatchEvent(new Event('bamboo-language-change'));}});
})();
