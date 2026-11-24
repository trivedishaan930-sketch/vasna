(() => {
  'use strict';
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const safeGet = (key, fallback) => { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const toast = message => { const box=$('#toast'); if(!box)return; box.textContent=message; box.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>box.classList.remove('show'),2500); };
  let saved = safeGet('velora.saved.v2', []);
  let profile = safeGet('velora.profile.v1', null);
  let deferredInstall = null;

  // Adults-only acknowledgement: this is a courtesy gate, not age verification.
  const gate=$('#ageGate');
  if(sessionStorage.getItem('velora.age.confirmed')==='yes') gate.hidden=true;
  $('#confirmAge')?.addEventListener('click',()=>{sessionStorage.setItem('velora.age.confirmed','yes');gate.hidden=true;});
  $('#leaveSite')?.addEventListener('click',()=>{gate.innerHTML='<div class="age-card"><h1>Thanks for visiting.</h1><p>VELORA is intended for adults aged 18 and over.</p></div>';});
  $('#year').textContent=new Date().getFullYear();

  // Mobile navigation.
  $('#mobileMenu')?.addEventListener('click',()=>{
    const open=$('#mainNav').classList.toggle('open');
    $('#mobileMenu').setAttribute('aria-expanded',String(open));
  });
  $$('#mainNav a').forEach(link=>link.addEventListener('click',()=>{
    $('#mainNav').classList.remove('open');$('#mobileMenu').setAttribute('aria-expanded','false');
  }));

  const destinations = {
    'Santorini': {country:'Greece',region:'Aegean Islands',best:'Late spring and early autumn are popular for milder walking conditions; peak summer is busier.',pace:'Views, villages, food and gentle coastal walks',ideas:['Walk a caldera path early in the day.','Explore a traditional village and local craft shops.','Choose a licensed boat trip or a relaxed beach afternoon.','Reserve a sunset viewpoint and leave time for dinner.'],budget:{Value:'Compare stays outside the busiest caldera locations.',Comfort:'Balance a sea-view stay with local tavernas.',Luxury:'Consider a small design hotel and a private experience.'},note:'Terrain can be steep and uneven; check accessibility and local transport.'},
    'Amalfi Coast': {country:'Italy',region:'Campania',best:'Late spring and early autumn can offer a balance of pleasant weather and fewer peak-season crowds.',pace:'Coastal villages, gardens, food and boat excursions',ideas:['Arrive and explore the area around your accommodation.','Visit a coastal village and enjoy a long lunch.','Choose a licensed boat excursion or a beach day.','Discover a garden, viewpoint or nearby town.'],budget:{Value:'Look at inland villages and public transport options.',Comfort:'Choose a well-connected base and a few special meals.',Luxury:'Consider a boutique stay and a private guided outing.'},note:'Coastal roads can be narrow and busy; plan transfers carefully.'},
    'Bali': {country:'Indonesia',region:'Island of Bali',best:'The drier months are often preferred for outdoor activities; local rainfall varies by region.',pace:'Culture, nature, wellness and beach time',ideas:['Settle in and explore the local neighbourhood.','Visit a temple or rice terrace with a local guide.','Choose a beach day or a food experience.','Book a reputable spa or nature activity.'],budget:{Value:'Compare guesthouses and locally run experiences.',Comfort:'Mix a quality hotel with independent dining.',Luxury:'Explore a resort stay and a private island excursion.'},note:'Respect temple dress codes and local customs; check current travel advisories.'},
    'Kyoto': {country:'Japan',region:'Kansai',best:'Spring and autumn are famous for seasonal scenery and can be very busy; plan popular sites early.',pace:'Gardens, architecture, craft, food and quiet streets',ideas:['Arrive and enjoy a neighbourhood walk.','Visit a garden and explore traditional streets respectfully.','Discover a market, craft workshop or tea experience.','Choose a temple visit and a riverside walk.'],budget:{Value:'Use rail and bus passes only where they suit your route.',Comfort:'Choose a central base and reserve selected experiences.',Luxury:'Consider a traditional inn and a private cultural guide.'},note:'Be considerate in residential lanes and observe photography restrictions.'},
    'Paris': {country:'France',region:'Île-de-France',best:'Spring and early autumn are popular for walking; indoor culture works year-round.',pace:'Art, architecture, cafés and neighbourhood exploration',ideas:['Settle in and explore your neighbourhood.','Choose a museum, garden or architecture walk.','Visit a market, bookshop or local café.','Take an evening river walk or attend a performance.'],budget:{Value:'Use public transport and book major museums ahead.',Comfort:'Choose a central neighbourhood and a mix of casual dining.',Luxury:'Consider a boutique hotel and a guided art experience.'},note:'Keep belongings secure in crowded tourist areas and transit.'},
    'Lisbon': {country:'Portugal',region:'Lisbon and Tagus estuary',best:'Late spring and early autumn are often pleasant for walking; summers can be hot and busy.',pace:'Historic neighbourhoods, viewpoints, food and coastal day trips',ideas:['Explore a historic neighbourhood on foot.','Visit a viewpoint and enjoy a riverside walk.','Choose a local food tour or cultural experience.','Consider a day trip to a nearby coastal town.'],budget:{Value:'Compare guesthouses and public transport options.',Comfort:'Choose a central base and a mix of local dining.',Luxury:'Consider a boutique hotel and a private guided outing.'},note:'Hills and cobbled pavements can be challenging; plan footwear and accessibility.'},
    'Maldives': {country:'Maldives',region:'Indian Ocean',best:'The dry season is commonly associated with calmer weather; conditions and prices vary by atoll.',pace:'Island relaxation, marine experiences and ocean views',ideas:['Arrive and enjoy the island surroundings.','Choose a licensed snorkelling or lagoon activity.','Keep a day open for rest and beach time.','Consider a responsible marine-life experience.'],budget:{Value:'Compare local-island guesthouses and transfer costs.',Comfort:'Balance a resort stay with included activities.',Luxury:'Consider an overwater villa and a private excursion.'},note:'Check transfer schedules, marine rules and resort inclusions before booking.'}
  };
  const plans = {
    'Santorini':['Arrive, settle in and enjoy a gentle village walk.','Explore caldera paths, local shops and a seaside lunch.','Choose a boat outing or a relaxed beach afternoon.','Visit a nearby village and a sunset viewpoint.','Enjoy a slow breakfast, a final stroll and departure.'],
    'Amalfi Coast':['Arrive and take an easy evening walk.','Explore a coastal village and enjoy a leisurely lunch.','Choose a boat excursion or a beach day.','Discover a garden, viewpoint or neighbouring town.','Enjoy breakfast and depart.'],
    'Bali':['Arrive, rest and explore the neighbourhood.','Visit a temple or rice terrace with a local guide.','Enjoy beach time and a relaxed meal.','Choose a nature walk, craft experience or spa.','Take a slow morning before departure.'],
    'Kyoto':['Arrive and enjoy a neighbourhood walk.','Visit a garden and explore traditional streets.','Discover a market, craft workshop or tea experience.','Choose a temple visit and scenic riverside walk.','Enjoy breakfast and depart.'],
    'Paris':['Arrive and explore your neighbourhood.','Choose a museum, garden or architectural walk.','Explore cafés, bookshops and a food market.','Enjoy a river walk and evening performance.','Have a relaxed breakfast before departure.'],
    'Lisbon':['Arrive and explore the neighbourhood around your stay.','Walk through a historic district and visit a viewpoint.','Choose a local food tour, market or museum.','Take a riverside stroll or a coastal day trip.','Enjoy a slow breakfast and depart.'],
    'Maldives':['Arrive, settle in and enjoy the island.','Choose a guided snorkelling or lagoon activity.','Keep a day open for rest and the beach.','Consider a responsible marine experience.','Enjoy a slow breakfast and depart.']
  };
  const showModal=(eyebrow,title,body,actions=[])=>{
    $('#modalEyebrow').textContent=eyebrow;
    $('#modalTitle').textContent=title;
    $('#modalBody').innerHTML=body;
    $('#modalActions').innerHTML='';
    actions.forEach(action=>{
      const button=document.createElement('button');button.className='btn '+(action.primary?'btn-gold':'btn-quiet');button.textContent=action.label;
      button.addEventListener('click',action.onClick);$('#modalActions').append(button);
    });
    $('#modalBackdrop').hidden=false;document.body.classList.add('no-scroll');$('#modalClose').focus();
  };
  const closeModal=()=>{$('#modalBackdrop').hidden=true;document.body.classList.remove('no-scroll');};
  $('#modalClose').addEventListener('click',closeModal);
  $('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});

  // Saved ideas are stored on the current device only.
  const addSaved=(name,type='Idea',detail='')=>{
    if(!saved.some(item=>item.name===name)){
      saved.unshift({name,type,detail,created:new Date().toISOString()});
      safeSet('velora.saved.v2',saved);renderSaved();toast(name+' saved to your collection.');
    }else toast('Already in your saved collection.');
  };
  const removeSaved=index=>{saved.splice(index,1);safeSet('velora.saved.v2',saved);renderSaved();};
  const renderSaved=()=>{
    $('#savedItems').innerHTML=saved.length?saved.map((item,index)=>'<div class="saved-entry"><span><b>'+escapeHTML(item.name)+'</b><br><small>'+escapeHTML(item.type)+'</small></span><button data-remove-saved="'+index+'">Remove</button></div>').join(''):'<p class="saved-empty">Your saved destinations, plans and essentials will appear here. Browse VELORA and save the ideas you like.</p>';
    $$('[data-remove-saved]').forEach(button=>button.addEventListener('click',()=>removeSaved(Number(button.dataset.removeSaved))));
    $$('[data-save]').forEach(button=>{const active=saved.some(item=>item.name===button.dataset.save);button.classList.toggle('saved',active);button.textContent=active?'♥':'♡';});
    $$('[data-shop-save]').forEach(button=>{const active=saved.some(item=>item.name===button.dataset.shopSave);button.classList.toggle('saved',active);button.textContent=active?'Added ✓':'Add to my list +';});
  };
  const openSaved=()=>{$('#savedDrawer').classList.add('open');$('#savedDrawer').setAttribute('aria-hidden','false');$('#drawerScrim').classList.add('open');renderSaved();};
  const closeSaved=()=>{$('#savedDrawer').classList.remove('open');$('#savedDrawer').setAttribute('aria-hidden','true');$('#drawerScrim').classList.remove('open');};
  $('#openSaved').addEventListener('click',openSaved);$('#savedClose').addEventListener('click',closeSaved);$('#drawerScrim').addEventListener('click',closeSaved);$('#mobileSaved')?.addEventListener('click',openSaved);
  $('#printSaved').addEventListener('click',()=>window.print());
  $$('#destinationGrid [data-save]').forEach(button=>button.addEventListener('click',()=>addSaved(button.dataset.save,'Destination')));
  $$('#shopGrid [data-shop-save]').forEach(button=>button.addEventListener('click',()=>addSaved(button.dataset.shopSave,'Essentials')));
  renderSaved();

  // Destination filtering and individual guides.
  $$('#destinationFilters [data-filter]').forEach(button=>button.addEventListener('click',()=>{
    $$('#destinationFilters [data-filter]').forEach(item=>item.classList.remove('selected'));button.classList.add('selected');
    const filter=button.dataset.filter;
    $$('.destination-card').forEach(card=>card.hidden=filter!=='all'&&!card.dataset.category.split(' ').includes(filter));
  }));
  const destinationGuide=name=>{
    const d=destinations[name];if(!d)return;
    const stats='<div class="guide-stats"><div class="guide-stat"><small>COUNTRY</small><b>'+escapeHTML(d.country)+'</b></div><div class="guide-stat"><small>REGION</small><b>'+escapeHTML(d.region)+'</b></div><div class="guide-stat"><small>TRAVEL STYLE</small><b>'+escapeHTML(d.pace.split(',')[0])+'</b></div></div>';
    const body=stats+'<p><b>Seasonal note:</b> '+escapeHTML(d.best)+'</p><p><b>Experience ideas</b></p><ul>'+d.ideas.map(x=>'<li>'+escapeHTML(x)+'</li>').join('')+'</ul><p><b>Budget direction</b></p><ul>'+Object.entries(d.budget).map(([k,v])=>'<li><b>'+escapeHTML(k)+':</b> '+escapeHTML(v)+'</li>').join('')+'</ul><p>'+escapeHTML(d.note)+'</p><p class="fineprint">This is curated inspiration, not a live weather or booking feed. Verify entry rules, seasonal conditions, local laws, safety and availability before making arrangements.</p>';
    showModal('DESTINATION GUIDE',name,body,[{label:'Add to trip planner',primary:true,onClick:()=>{closeModal();$('#tripDestination').value=name;$('#planner').scrollIntoView({behavior:'smooth'});toast(name+' selected in your planner.');}},{label:'Save destination',onClick:()=>addSaved(name,'Destination')}]);
  };
  $$('[data-destination]').forEach(button=>button.addEventListener('click',()=>destinationGuide(button.dataset.destination)));

  // Quick planner feeds the full itinerary planner.
  $('#heroPlanner').addEventListener('submit',e=>{
    e.preventDefault();$('#tripDestination').value=$('#heroDestination').value;$('#tripMonth').value=$('#heroMonth').value;
    $('#tripParty').value=$('#heroParty').value==='Couple'?'Couple':$('#heroParty').value;
    $('#tripBudget').value=$('#heroBudget').value;
    $('#planner').scrollIntoView({behavior:'smooth'});$('#tripForm').requestSubmit();
  });
  $('#tripForm').addEventListener('submit',e=>{
    e.preventDefault();
    const destination=$('#tripDestination').value,month=$('#tripMonth').value,length=Number($('#tripLength').value),party=$('#tripParty').value,budget=$('#tripBudget').value,mood=$('#tripMood').value;
    const days=(plans[destination]||plans.Paris).slice(0,length);
    const title=destination+' · '+length+' days';
    const result=$('#itineraryResult');
    result.hidden=false;
    result.innerHTML='<span class="eyebrow">YOUR STARTER JOURNEY</span><h3>'+escapeHTML(destination)+' in '+escapeHTML(month)+'</h3><p>'+escapeHTML(party)+' · '+length+' days · '+escapeHTML(budget)+' budget style · '+escapeHTML(mood)+'.</p>'+days.map((day,i)=>'<div class="itinerary-day"><b>DAY '+(i+1)+'</b><span>'+escapeHTML(day)+'</span></div>').join('')+'<p class="fineprint">Budget style is a planning preference, not a price estimate. This sample does not verify current rates, transport, weather or availability.</p><div class="note-actions"><button class="btn btn-gold" id="saveTrip">♡ Save this plan</button><button class="btn btn-quiet" id="printTrip">Print / PDF</button></div>';
    $('#saveTrip').addEventListener('click',()=>addSaved(title,'Trip plan',party+' · '+month+' · '+budget));
    $('#printTrip').addEventListener('click',()=>window.print());
  });

  // Moment ideas open as usable mini-plans.
  const experienceIdeas={
    'Slow mornings':['Choose a café with a view.','Take an unhurried walk.','Leave the first part of the day unscheduled.'],
    'Evening rituals':['Pick a restaurant with a calm atmosphere.','Agree on a screen-free hour.','Finish with a short walk or a favourite dessert.'],
    'Couple adventures':['Choose a guided activity that both people feel comfortable with.','Agree on pace, budget and accessibility needs.','Keep a flexible alternative in case conditions change.'],
    'Solo discoveries':['Try a public workshop, class or guided tour.','Choose a café, gallery or local market.','Share your plans with someone you trust.']
  };
  $$('[data-experience]').forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.experience,steps=experienceIdeas[name]||[];
    showModal('EXPERIENCE IDEA',name,'<p>A small experience plan to personalise.</p><ul>'+steps.map(s=>'<li>'+escapeHTML(s)+'</li>').join('')+'</ul>',[{label:'Save this idea',primary:true,onClick:()=>addSaved(name,'Experience idea')}]);
  }));

  // Style studio: static wardrobe advice, intentionally not a product endorsement.
  const styleMatrix={
    'Coastal escape':{
      'Warm and sunny':{Men:'Light linen shirt, tailored shorts or relaxed trousers, leather sandals, sunglasses and a breathable overshirt for evening.',Women:'A breathable cotton or linen dress, swim cover-up for appropriate settings, comfortable sandals, sun hat and a light evening layer.',Couple:'Coordinate with a shared palette such as ivory, sand and muted blue; choose breathable fabrics and comfortable footwear.',Unisex:'Relaxed linen layers, versatile shorts or trousers, comfortable sandals and simple sun protection.'},
      'Mild and breezy':{Men:'Linen trousers, a breathable tee, lightweight overshirt and supportive shoes.',Women:'A midi dress with a light cardigan or linen set, comfortable flats and a scarf for the breeze.',Couple:'Use complementary neutrals with one shared accent colour and light layers for the evening.',Unisex:'A light knit over a breathable base, easy trousers and a versatile jacket.'},
      'Cool and layered':{Men:'Fine knit, weather-resistant outer layer, dark trousers and comfortable closed shoes.',Women:'Layered knitwear, a structured coat, comfortable trousers and ankle boots.',Couple:'Coordinate outerwear tones rather than matching outfits; prioritise warmth and rain protection.',Unisex:'A warm base layer, insulating mid-layer, weatherproof coat and grippy footwear.'}},
    'Romantic dinner':{
      'Warm and sunny':{Men:'A crisp breathable shirt, tailored trousers, polished loafers and one understated accessory.',Women:'A refined summer dress or coordinated set, comfortable dress sandals and simple jewellery.',Couple:'Choose complementary tones and polished silhouettes; avoid identical outfits.',Unisex:'A clean tailored outfit in breathable fabric with understated accessories.'},
      'Mild and breezy':{Men:'Tailored trousers, open-collar shirt, light blazer and comfortable dress shoes.',Women:'A midi dress with a fine layer, elegant flats or heels suited to the venue.',Couple:'Use a common palette such as navy, cream or warm taupe with different silhouettes.',Unisex:'A neat smart-casual layer, tailored trousers and comfortable polished shoes.'},
      'Cool and layered':{Men:'A fine knit or shirt with a tailored coat, trousers and weather-ready leather shoes.',Women:'A knit dress or tailored separates with a warm coat and closed-toe shoes.',Couple:'Coordinate coat colours and textures while dressing for the actual temperature.',Unisex:'A smart warm layer, structured coat, tailored trousers and weatherproof footwear.'}},
    'City exploring':{
      'Warm and sunny':{Men:'Breathable shirt, relaxed chinos, walking sneakers, sunglasses and a small crossbody bag.',Women:'A cotton dress or relaxed separates, supportive walking shoes and compact bag.',Couple:'Choose coordinated neutrals and comfortable shoes for long city walks.',Unisex:'A comfortable breathable outfit, supportive walking shoes and a small day bag.'},
      'Mild and breezy':{Men:'Light overshirt, tee, tailored trousers and cushioned walking shoes.',Women:'A light jacket, versatile trousers or dress and comfortable flats.',Couple:'Layer in a shared colour family while keeping footwear practical.',Unisex:'A transitional jacket, breathable layers and broken-in walking shoes.'},
      'Cool and layered':{Men:'Warm base layer, wool overshirt or coat, trousers and weather-resistant shoes.',Women:'Layered knit, comfortable trousers, coat and supportive boots.',Couple:'Coordinate outerwear tones, scarves and practical layers.',Unisex:'A thermal base, insulating layer, coat and grippy walking shoes.'}},
    'Resort evening':{
      'Warm and sunny':{Men:'Relaxed linen shirt, tailored resort trousers or shorts and neat sandals.',Women:'A flowing evening dress or elegant co-ord with comfortable sandals.',Couple:'Choose breathable fabrics and harmonised tones for polished resort style.',Unisex:'A light relaxed set with clean lines and refined accessories.'},
      'Mild and breezy':{Men:'Linen trousers, a lightweight knit or overshirt and loafers.',Women:'A flowing dress with a light wrap and comfortable shoes.',Couple:'Mix a refined neutral base with one muted accent colour.',Unisex:'A lightweight layer, relaxed tailored separates and smart flats.'},
      'Cool and layered':{Men:'Fine knit, tailored trousers and a clean jacket.',Women:'A long-sleeve dress or tailored set with a warm wrap.',Couple:'Keep silhouettes elegant while adding suitable outerwear.',Unisex:'A refined knit layer, trousers and a structured jacket.'}},
    'Outdoor adventure':{
      'Warm and sunny':{Men:'Moisture-wicking tee, breathable shorts, trail shoes, hat and sun protection.',Women:'Light activewear, supportive shoes, hat and a breathable layer.',Couple:'Coordinate practical colours; choose shoes and layers for the actual activity.',Unisex:'Technical breathable layers, supportive footwear and sun protection.'},
      'Mild and breezy':{Men:'Quick-dry base, light shell, flexible trousers and trail shoes.',Women:'Breathable active layers, light shell and supportive trainers.',Couple:'Choose adaptable layers and avoid cotton for strenuous wet-weather activities.',Unisex:'Quick-dry layers, packable shell and activity-appropriate footwear.'},
      'Cool and layered':{Men:'Thermal base, insulating mid-layer, weatherproof shell and grippy shoes.',Women:'Thermal layers, warm mid-layer, protective shell and appropriate boots.',Couple:'Prioritise safety and suitable layers over visual coordination.',Unisex:'Thermal base, insulation, weatherproof shell and grippy footwear.'}}
  };
  $('#styleForm').addEventListener('submit',e=>{
    e.preventDefault();const who=$('#styleFor').value,occasion=$('#styleOccasion').value,weather=$('#styleWeather').value;
    const recommendation=styleMatrix[occasion][weather][who];
    $('#styleOutput').innerHTML='<small>YOUR PERSONAL STYLE NOTE</small><p>'+escapeHTML(recommendation)+'</p><p class="fineprint">Adapt to local forecast, venue dress codes, cultural expectations and your own comfort. These are general style ideas, not product endorsements.</p>';
    $('#styleOutput').scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  // Shop filters.
  $$('#shopTabs [data-shop]').forEach(button=>button.addEventListener('click',()=>{
    $$('#shopTabs button').forEach(item=>item.classList.remove('selected'));button.classList.add('selected');
    const filter=button.dataset.shop;
    $$('#shopGrid .shop-card').forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter);
  }));

  // Original journal stories.
  const stories={
    santorini:{title:'The Last Light in Santorini',paragraphs:['The village was quieter than they expected. After a day of missed turns and too many photographs, they found a small terrace overlooking the water.','They put their phones away. The sea changed from blue to silver, then to a soft shade of rose. No grand gesture was needed; a shared plate, an unhurried conversation and the comfort of being listened to were enough.','When the last light slipped behind the horizon, they made no promise to repeat the evening exactly. They simply agreed to leave a little room for moments they could not plan.']},
    present:{title:'The Art of Being Present',paragraphs:['A good day does not always need a packed itinerary. Sometimes it begins with coffee that stays warm, a walk without a destination and the decision to listen without checking the time.','Presence is not a perfect skill. It is a small choice made again and again: notice the view, ask a better question, put the phone away for a while.','The memory that lasts may be the simplest one — a laugh that arrived unexpectedly, or the feeling that there was nowhere else you needed to be.']},
    solo:{title:'A Table for One',paragraphs:['At first, the empty chair opposite felt louder than the restaurant. Then the menu arrived, the music softened and the evening began to belong to its guest.','There was time to savour the food, notice the room and choose the next stop without negotiating a plan. A solo evening was not a waiting room for another life; it was a small celebration of the one already happening.','On the walk home, the city seemed a little more welcoming. Sometimes connection begins with becoming comfortable in your own company.']}
  };
  $$('.story-open').forEach(button=>button.addEventListener('click',()=>{
    const story=stories[button.dataset.story];if(!story)return;
    showModal('THE VELORA JOURNAL',story.title,story.paragraphs.map(p=>'<p>'+escapeHTML(p)+'</p>').join(''),[{label:'Save this story',primary:true,onClick:()=>addSaved(story.title,'Journal story')}]);
  }));

  // Photo-storyboard prompt creator. It outputs prompt text; no AI image or video API is called.
  const scenesByMood={
    'Golden-hour getaway':[
      ['First glimpse','A wide establishing frame of two adults arriving at a beautiful seaside resort, noticing the view and exchanging a friendly smile.'],
      ['Shared discovery','The couple walks side by side along a coastal promenade, relaxed expressions, gentle breeze and warm natural light.'],
      ['Little details','A close detail of two hands meeting over a café table, coffee, flowers and the sea softly out of focus.'],
      ['Golden hour','The couple pauses at a scenic viewpoint, looking toward the horizon and smiling together.'],
      ['A keepsake','A wide closing frame of the couple walking toward the resort lights, relaxed and happy.'],
      ['A new morning','A fresh morning scene with the couple exploring a local market and choosing a small keepsake.'],
      ['Until next time','A final wide shot overlooking the coastline, the couple standing together with the landscape in view.']
    ],
    'City date night':[
      ['City arrival','A wide establishing frame of two adults arriving on an elegant city street at dusk.'],
      ['Window shopping','The couple strolls past illuminated shop windows, smiling and chatting.'],
      ['The little café','They share a warm conversation at a small café table, soft practical lighting and natural expressions.'],
      ['City lights','A cinematic side view as the couple walks beneath warm streetlights.'],
      ['A quiet moment','They pause at a city viewpoint and take in the skyline together.'],
      ['A favourite song','A respectful, relaxed slow dance in an elegant public terrace setting.'],
      ['Night walk','A wide final shot of the pair walking down a beautiful illuminated street.']
    ],
    'Island adventure':[
      ['Arrival by water','A wide cinematic view of two adults arriving at a tropical island by boat.'],
      ['Island path','The couple explores a palm-lined path beside the ocean.'],
      ['Ocean discovery','They enjoy a guided, safe ocean activity with appropriate life jackets and equipment.'],
      ['Seaside lunch','A relaxed lunch under a shaded cabana, sharing a laugh.'],
      ['Sunset shoreline','A wide view of the pair walking along the shoreline in the sunset.'],
      ['Resort evening','The couple enjoys a relaxed outdoor evening with elegant resort attire.'],
      ['Island farewell','A final landscape-led frame of the couple watching the horizon from a safe viewpoint.']
    ],
    'Anniversary celebration':[
      ['A thoughtful surprise','A warmly lit room with flowers and a handwritten note, the couple entering together.'],
      ['Getting ready','Two adults preparing for a special evening in elegant, fully clothed outfits.'],
      ['A special table','A beautifully styled dinner table, flowers, candles and a shared smile.'],
      ['The celebration','The couple raises sparkling water glasses in a joyful toast.'],
      ['A gentle embrace','A respectful, affectionate embrace beneath soft warm lights.'],
      ['The dance','A relaxed slow dance on a terrace, cinematic wide framing.'],
      ['A memory together','A final portrait-style frame of the couple smiling with the evening lights behind them.']
    ]
  };
  $('#createStoryboard').addEventListener('click',()=>{
    const mood=$('#storyMood').value,total=Number($('#storyLength').value),count=total/5,scenes=scenesByMood[mood].slice(0,count);
    const output=$('#storyboardResult');output.hidden=false;
    output.innerHTML='<h4>'+escapeHTML(mood)+' · '+count+' scenes</h4>'+scenes.map((scene,index)=>'<div class="storyboard-scene"><b>SCENE '+(index+1)+' · '+((index*5)+1)+'–'+((index+1)*5)+' SEC</b><p><strong>'+escapeHTML(scene[0])+':</strong> '+escapeHTML(scene[1])+' Photorealistic cinematic photography, consistent adult character identities and clothing, natural anatomy, tasteful fully clothed presentation, no scene cuts within the shot.</p></div>').join('')+'<button class="btn btn-dark btn-wide" id="copyStoryboard">Copy all scene prompts</button>';
    $('#copyStoryboard').addEventListener('click',()=>{
      const text=scenes.map((scene,index)=>'SCENE '+(index+1)+' ('+(index*5)+'–'+((index+1)*5)+' seconds): '+scene[0]+'. '+scene[1]+' Photorealistic cinematic photography, consistent adult character identities and clothing, natural anatomy, tasteful fully clothed presentation, no scene cuts within the shot.').join('\n\n');
      copyText(text,'Storyboard prompts copied.');
    });
    output.scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  // Curated no-API concierge demo.
  const conciergeReply=question=>{
    const q=question.toLowerCase();
    if(/destination|where|honeymoon|travel|trip|romantic place/.test(q))return 'For a scenic coastal escape, explore Santorini or the Amalfi Coast; for a slower tropical trip, compare Bali and the Maldives. The best choice depends on your month, budget, mobility and current entry requirements. Use the Travel Planner to sketch a sample itinerary.';
    if(/outfit|clothes|fashion|wear|style|dress/.test(q))return 'Start with breathable layers, comfortable footwear and sun protection. Think about the local weather, cultural expectations and venue dress code. The Style & Fashion Studio can suggest a look for men, women or couples.';
    if(/solo|alone|lonely|date idea|companionship/.test(q))return 'A gentle solo plan could be a guided city walk, a public workshop, a favourite café or a gallery visit. Choose settings where you feel comfortable, tell someone you trust where you are going and let the day move at your own pace.';
    if(/health|medicine|stamina|condom|protection|sexual/.test(q))return 'For personal health concerns, speak with a licensed clinician or pharmacist. Choose regulated sexual-health products from reputable sellers, check compatibility instructions, and never rely on unverified stamina or supplement claims. I can help you prepare a general travel-health checklist, but I cannot diagnose or prescribe.';
    if(/story|fiction|read/.test(q))return 'Open the VELORA Journal for original fiction and reflections about connection, presence and solo discovery. Choose a story card to read a complete short piece.';
    if(/budget|cheap|free|cost/.test(q))return 'Start by choosing a budget style rather than assuming live prices. Compare transport, accommodation, local transfers, meals and activities separately. VELORA’s sample planner can organise your priorities, but it does not query current rates.';
    return 'I can help with destination inspiration, a sample getaway plan, outfit guidance, packing essentials, romantic experience ideas or original stories. Tell me the kind of experience you are imagining.';
  };
  const addChatMessage=(message,role)=>{
    const node=document.createElement('div');node.className='message '+role;
    const label=document.createElement('small');label.textContent=role==='user'?'YOU':'VELORA';
    const p=document.createElement('p');p.textContent=message;node.append(label,p);$('#chatMessages').append(node);$('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;
  };
  const sendChat=message=>{if(!message.trim())return;addChatMessage(message,'user');setTimeout(()=>addChatMessage(conciergeReply(message),'assistant'),100);};
  $('#chatForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#chatInput');sendChat(input.value);input.value='';});
  $$('.chat-suggestions [data-question]').forEach(button=>button.addEventListener('click',()=>sendChat(button.dataset.question)));
  $('#clearChat').addEventListener('click',()=>{$('#chatMessages').innerHTML='<div class="message assistant"><small>VELORA</small><p>Welcome. What would make your next experience feel special?</p></div>';});

  // Local-only profile.
  const profileBackdrop=$('#profileBackdrop');
  const openProfile=()=>{if(profile){$('#profileName').value=profile.name||'';$('#profileIntent').value=profile.intent||'Travel inspiration';}profileBackdrop.hidden=false;document.body.classList.add('no-scroll');};
  const closeProfile=()=>{profileBackdrop.hidden=true;document.body.classList.remove('no-scroll');};
  $('#profileOpen').addEventListener('click',openProfile);$('#joinOpen').addEventListener('click',openProfile);
  $('#profileClose').addEventListener('click',closeProfile);$('#profileCancel').addEventListener('click',closeProfile);
  profileBackdrop.addEventListener('click',e=>{if(e.target===profileBackdrop)closeProfile();});
  $('#profileForm').addEventListener('submit',e=>{
    e.preventDefault();profile={name:$('#profileName').value.trim(),intent:$('#profileIntent').value};
    safeSet('velora.profile.v1',profile);closeProfile();toast('Your preferences were saved on this device.');
    $('#profileOpen').textContent=profile.name?'Hi, '+profile.name.split(' ')[0]:'My profile';
  });
  if(profile?.name)$('#profileOpen').textContent='Hi, '+profile.name.split(' ')[0];

  // Site search searches the sections already available on this page.
  const searchItems=[
    ['Santorini','Destination','destination'],['Amalfi Coast','Destination','destination'],['Bali','Destination','destination'],['Kyoto','Destination','destination'],['Paris','Destination','destination'],['Maldives','Destination','destination'],['Lisbon','Destination','destination'],
    ['Romantic Experiences','Experiences','experiences'],['Style & Fashion','Style','style'],['Travel Essentials','Shop','shop'],['Sexual Health Basics','Wellness','wellbeing'],['Romance Stories','Journal','journal'],['VELORA Concierge','Concierge','concierge']
  ];
  const searchBackdrop=$('#searchBackdrop');
  const openSearch=()=>{searchBackdrop.hidden=false;document.body.classList.add('no-scroll');$('#siteSearch').focus();renderSearch('');};
  const closeSearch=()=>{searchBackdrop.hidden=true;document.body.classList.remove('no-scroll');};
  $('#searchOpen').addEventListener('click',openSearch);$('#searchClose').addEventListener('click',closeSearch);
  searchBackdrop.addEventListener('click',e=>{if(e.target===searchBackdrop)closeSearch();});
  const renderSearch=query=>{
    const matches=searchItems.filter(item=>(item[0]+' '+item[1]).toLowerCase().includes(query.toLowerCase())).slice(0,10);
    $('#searchResults').innerHTML=matches.length?matches.map(item=>'<button data-search-target="'+item[2]+'"><b>'+escapeHTML(item[0])+'</b> <span>· '+escapeHTML(item[1])+'</span></button>').join(''):'<p class="saved-empty">No matches yet. Try a destination, style, story or experience.</p>';
    $$('[data-search-target]').forEach(button=>button.addEventListener('click',()=>{const target=button.dataset.searchTarget;closeSearch();if(target==='destination'){const found=searchItems.find(x=>x[2]===target&&x[0]===button.querySelector('b').textContent);if(found)destinationGuide(found[0]);}else $('#'+target)?.scrollIntoView({behavior:'smooth'});}));
  };
  $('#siteSearch').addEventListener('input',e=>renderSearch(e.target.value));

  // Copy helpers and keyboard dismissal.
  function copyText(text,success){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>toast(success)).catch(()=>toast('Copy is unavailable in this browser.'));}else toast('Copy requires a secure browser context.');}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeProfile();closeSearch();closeSaved();}});

  // Installable PWA hint; the browser decides when installation is supported.
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();deferredInstall=event;
    const install=document.createElement('button');install.className='btn btn-outline btn-small';install.id='installApp';install.textContent='Install app';
    $('.header-actions').append(install);
    install.addEventListener('click',async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;install.remove();});
  });
  if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();