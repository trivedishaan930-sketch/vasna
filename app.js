(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const safeGet = (key, fallback) => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  let saved = safeGet('velora-saved', []);
  let checked = safeGet('velora-checklist', []);
  const toast = (message) => { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2500); };
  const updateSaved = () => {
    $('#savedCount').textContent=saved.length;
    $$('.save-card').forEach(b=>{const on=saved.some(x=>x.name===b.dataset.save);b.classList.toggle('saved',on);b.textContent=on?'♥':'♡';});
    const list=$('#savedItems');
    if(!saved.length){list.innerHTML='<p class="empty-saved">Your saved destinations and plans will appear here.</p>';return;}
    list.innerHTML=saved.map((x,i)=>'<div class="saved-entry"><span>'+escapeHtml(x.name)+'</span><button data-remove="'+i+'">Remove</button></div>').join('');
    $$('[data-remove]',list).forEach(b=>b.addEventListener('click',()=>{saved.splice(Number(b.dataset.remove),1);safeSet('velora-saved',saved);updateSaved();}));
  };
  const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const openDrawer=()=>{$('#savedDrawer').classList.add('open');$('#savedDrawer').setAttribute('aria-hidden','false');$('#drawerScrim').classList.add('open');updateSaved();};
  const closeDrawer=()=>{$('#savedDrawer').classList.remove('open');$('#savedDrawer').setAttribute('aria-hidden','true');$('#drawerScrim').classList.remove('open');};
  $('#savedButton').addEventListener('click',openDrawer);$('#showSaved').addEventListener('click',openDrawer);$('#closeSaved').addEventListener('click',closeDrawer);$('#drawerScrim').addEventListener('click',closeDrawer);
  $$('.save-card').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.save;const i=saved.findIndex(x=>x.name===name);if(i>=0){saved.splice(i,1);toast(name+' removed from saved ideas.');}else{saved.push({name,type:'Destination'});toast(name+' saved to your collection.');}safeSet('velora-saved',saved);updateSaved();}));
  updateSaved();

  const gate=$('#ageGate');
  if(sessionStorage.getItem('velora-age-ok')==='yes')gate.hidden=true;
  $('#confirmAge').addEventListener('click',()=>{sessionStorage.setItem('velora-age-ok','yes');gate.hidden=true;});
  $('#leaveSite').addEventListener('click',()=>{gate.innerHTML='<div class="age-card"><h1>Thanks for visiting.</h1><p>VELORA is intended for adults aged 18 and over.</p></div>';});
  $('#menuToggle').addEventListener('click',()=>{const open=$('#mainNav').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));});
  $$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');}));
  $('#year').textContent=new Date().getFullYear();

  $$('.filter-chip').forEach(chip=>chip.addEventListener('click',()=>{$$('.filter-chip').forEach(c=>c.classList.remove('selected'));chip.classList.add('selected');const f=chip.dataset.filter;$$('.destination-card').forEach(card=>card.hidden=!(f==='all'||card.dataset.category.split(' ').includes(f)));}));
  const chooseDestination = name => {$('#tripDestination').value=name;$('#planner').scrollIntoView({behavior:'smooth'});toast(name+' added to your trip planner.');};
  $$('[data-destination]').forEach(b=>b.addEventListener('click',()=>chooseDestination(b.dataset.destination)));
  $('#quickForm').addEventListener('submit',e=>{e.preventDefault();$('#tripDestination').value=$('#quickDestination').value;$('#tripMonth').value=$('#quickMonth').value;$('#tripType').value=$('#quickFor').value;$('#planner').scrollIntoView({behavior:'smooth'});$('#tripForm').requestSubmit();});

  const plans={
    'Santorini':{vibe:'Aegean views, village walks and unhurried evenings',days:['Arrive, settle in and enjoy a gentle walk through the village.','Explore the caldera paths, local shops and a long seaside lunch.','Choose a boat outing or a relaxed beach afternoon.','Visit a nearby village, then enjoy a sunset viewpoint.','Slow breakfast, a final stroll and departure.']},
    'Amalfi Coast':{vibe:'Coastal villages, food discoveries and scenic routes',days:['Arrive and take an easy evening walk near your stay.','Explore a coastal village and enjoy a leisurely lunch.','Choose a boat excursion or a beach day.','Discover a garden, viewpoint or neighbouring town.','Enjoy breakfast, collect your memories and depart.']},
    'Bali':{vibe:'Green landscapes, beach time and restorative rituals',days:['Arrive, rest and explore the neighbourhood.','Visit a temple or rice terrace with a local guide.','Enjoy a beach day and a relaxed evening meal.','Choose a nature walk, craft experience or spa.','Take a slow morning before departure.']},
    'Kyoto':{vibe:'Gardens, architecture, food culture and quiet streets',days:['Arrive and enjoy a neighbourhood walk.','Visit a garden and explore traditional streets respectfully.','Discover a market, craft workshop or tea experience.','Choose a temple visit and a scenic riverside walk.','Enjoy breakfast and depart.']},
    'Paris':{vibe:'Art, neighbourhood cafés and classic city wandering',days:['Arrive and take an easy walk around your neighbourhood.','Choose a museum, garden or architectural walk.','Explore local cafés, bookshops and a food market.','Enjoy a river walk and an evening performance.','Have a relaxed breakfast before departure.']},
    'Maldives':{vibe:'Island time, ocean views and slow days',days:['Arrive, settle in and enjoy the island surroundings.','Choose a guided snorkelling or lagoon activity.','Keep a day open for rest, reading and the beach.','Enjoy a responsible marine experience or sunset cruise.','Have a slow breakfast and depart.']}
  };
  $('#tripForm').addEventListener('submit',e=>{
    e.preventDefault();const dest=$('#tripDestination').value,month=$('#tripMonth').value,len=Number($('#tripLength').value),type=$('#tripType').value,mood=$('#tripMood').value,p=plans[dest];
    const days=p.days.slice(0,len);while(days.length<len)days.push('Keep the day flexible for a local experience, a favourite café or a little rest.');
    const result=$('#itineraryResult');
    result.hidden=false;
    result.innerHTML='<span class="result-label">YOUR STARTER ITINERARY · SAMPLE IDEAS</span><h3>'+escapeHtml(dest)+' in '+escapeHtml(month)+'</h3><p>'+escapeHtml(type)+' trip · '+len+' days · '+escapeHtml(mood)+' mood<br>'+escapeHtml(p.vibe)+'</p>'+days.map((d,i)=>'<div class="itinerary-day"><b>DAY '+(i+1)+'</b><span>'+escapeHtml(d)+'</span></div>').join('')+'<div class="result-actions"><button class="button button-primary" id="saveItinerary">♡ Save this plan</button><button class="button button-quiet" id="printItinerary">Print / PDF</button></div><p class="data-note">Illustrative itinerary only. Check current local conditions, transport, entry rules, operator credentials and availability independently.</p>';
    $('#saveItinerary').addEventListener('click',()=>{if(!saved.some(x=>x.name===dest+' · '+len+' days'))saved.push({name:dest+' · '+len+' days',type:'Trip plan'});safeSet('velora-saved',saved);updateSaved();toast('Your starter itinerary is saved on this device.');});
    $('#printItinerary').addEventListener('click',()=>window.print());
  });

  const outfitIdeas={
    coastal:{warm:'Choose breathable linen, a relaxed cotton shirt or sundress, comfortable sandals, sunglasses and a sun hat. Add a light layer for the evening.',mild:'Try linen trousers, a light knit or overshirt, closed-toe walking shoes and a scarf for the sea breeze.',cool:'Build layers with a fine knit, weatherproof outer layer, comfortable trousers and supportive shoes.'},
    city:{warm:'A breathable shirt or polished summer dress, smart walking shoes and a compact crossbody bag work well for a city day.',mild:'Try tailored trousers, a light jacket, a versatile top and comfortable shoes for long walks.',cool:'Layer a warm knit under a coat, add comfortable boots and keep a scarf handy.'},
    dinner:{warm:'Choose a refined lightweight outfit in a breathable fabric, polished sandals or shoes and one simple accessory.',mild:'A smart-casual outfit with a light jacket and comfortable dress shoes balances style and comfort.',cool:'A tailored layer, warm fabric and weather-appropriate shoes make an elegant, practical evening look.'},
    explore:{warm:'Wear breathable layers, supportive walking shoes, a hat and a small day bag; keep sun protection close.',mild:'Choose comfortable trousers, a light layer and well-broken-in walking shoes.',cool:'Use a warm base layer, insulating mid-layer, weatherproof coat and grippy shoes.'}
  };
  const styleFinishes={elegant:'Keep the palette tonal and accessories minimal.',relaxed:'Prioritise movement, easy-care fabrics and pieces you already love.',polished:'Add one statement detail while keeping the rest comfortable.'};
  $('#styleForm').addEventListener('submit',e=>{e.preventDefault();const o=$('#styleOccasion').value,w=$('#styleWeather').value,m=$('#styleMood').value;$('#styleResult').innerHTML='<span class="result-label">YOUR STYLE STARTING POINT</span><p>'+outfitIdeas[o][w]+' '+styleFinishes[m]+'</p><p class="data-note">Adapt this to local weather, venue dress codes and your comfort.</p>';});

  const checks=$$('#checklist input');
  checks.forEach(c=>{c.checked=checked.includes(c.value);c.addEventListener('change',()=>{checked=checks.filter(x=>x.checked).map(x=>x.value);safeSet('velora-checklist',checked);updateProgress();});});
  function updateProgress(){const n=checks.filter(c=>c.checked).length;$('#checkProgress').textContent=n+' / '+checks.length;$('#progressBar').style.width=(n/checks.length*100)+'%';}
  $('#resetChecklist').addEventListener('click',()=>{checks.forEach(c=>c.checked=false);checked=[];safeSet('velora-checklist',checked);updateProgress();toast('Packing list reset.');});updateProgress();

  const stories={
    santorini:{title:'The Last Light in Santorini',body:['The village was quieter than they expected. After a day of missed turns and too many photographs, they found a small terrace overlooking the water.','They put their phones away. The sea changed from blue to silver, then to a soft shade of rose. No grand gesture was needed; a shared plate, an unhurried conversation and the comfort of being listened to were enough.','When the last light slipped behind the horizon, they made no promise to repeat the evening exactly. They simply agreed to leave a little room for moments they could not plan.']},
    present:{title:'The Art of Being Present',body:['A good day does not always need a packed itinerary. Sometimes it begins with coffee that stays warm, a walk without a destination and the decision to listen without checking the time.','Presence is not a perfect skill. It is a small choice made again and again: notice the view, ask a better question, put the phone away for a while.','The memory that lasts may be the simplest one — a laugh that arrived unexpectedly, or the feeling that there was nowhere else you needed to be.']},
    solo:{title:'A Table for One, A World of Possibility',body:['At first, the empty chair opposite felt louder than the restaurant. Then the menu arrived, the music softened and the evening began to belong to its guest.','There was time to savour the food, notice the room and choose the next stop without negotiating a plan. A solo evening was not a waiting room for another life; it was a small celebration of the one already happening.','On the walk home, the city seemed a little more welcoming. Sometimes connection begins with becoming comfortable in your own company.']}
  };
  $$('.story-open').forEach(b=>b.addEventListener('click',()=>{const s=stories[b.dataset.story];$('#modalTitle').textContent=s.title;$('#modalContent').innerHTML=s.body.map(p=>'<p>'+escapeHtml(p)+'</p>').join('');$('#modalBackdrop').hidden=false;document.body.classList.add('no-scroll');$('#modalClose').focus();}));
  const closeModal=()=>{$('#modalBackdrop').hidden=true;document.body.classList.remove('no-scroll');};
  $('#modalClose').addEventListener('click',closeModal);$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});

  const reply = text => {
    const t=text.toLowerCase();
    if(/destination|where|romantic|honeymoon|trip|travel/.test(t))return 'For a coastal escape, consider Santorini or the Amalfi Coast for village walks and sea views; for a slower tropical break, explore Bali or the Maldives. Your best choice depends on dates, budget, mobility and current entry requirements. I can help sketch a starter itinerary in the Travel Planner.';
    if(/pack|clothes|outfit|wear|style|weather/.test(t))return 'Start with breathable layers, comfortable walking shoes, sun protection and one outfit that feels special to you. Check the destination forecast close to departure and respect venue dress codes. Try the Style Studio for a more tailored outfit direction.';
    if(/solo|alone|lonely|date/.test(t))return 'A gentle solo plan can be a favourite café, a guided walking tour, a museum visit or a class where conversation happens naturally. Keep your own pace, choose public settings and share your plans with someone you trust. Being on your own does not mean you have to stay disconnected.';
    if(/health|medicine|stamina|condom|protection/.test(t))return 'For personal health questions, a licensed clinician or pharmacist is the safest source. Pack medicines in their original packaging, check destination rules, and choose reputable sexual-health products from regulated sellers. I cannot diagnose conditions or recommend stamina medicines.';
    if(/story|read|book/.test(t))return 'The Velora Journal has short original fiction and reflections about connection, presence and solo experiences. Choose a story card above to read one.';
    return 'I can help with destination inspiration, a sample trip plan, outfit ideas, packing essentials or a short story. Tell me your destination, travel month or the kind of experience you have in mind.';
  };
  const addMessage=(text,who)=>{const div=document.createElement('div');div.className='chat-message '+who;const label=document.createElement('span');label.className='chat-label';label.textContent=who==='user'?'YOU':'VELORA';const p=document.createElement('p');p.textContent=text;div.append(label,p);$('#chatMessages').append(div);$('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;};
  const sendChat=text=>{if(!text.trim())return;addMessage(text,'user');setTimeout(()=>addMessage(reply(text),'assistant'),180);};
  $('#chatForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#chatInput');sendChat(input.value);input.value='';});
  $$('.suggestion').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.question)));
  $('#clearChat').addEventListener('click',()=>{$('#chatMessages').innerHTML='<div class="chat-message assistant"><span class="chat-label">VELORA</span><p>Welcome back. What would make your next experience feel special?</p></div>';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeDrawer();}});

  if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();