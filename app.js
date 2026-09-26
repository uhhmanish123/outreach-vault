const allFiles = [
  '01a-whatsapp-identity-redacted.png','01b-linkedin-identity-redacted.png','02-identity-redacted.png',
  '04-identity-redacted.png','05-identity-redacted.png','06-identity-redacted.png','07-identity-redacted.png',
  '08-identity-redacted.png','09-identity-redacted.png','10-identity-redacted.png','11-identity-redacted.png',
  '12-identity-redacted.png','13-identity-redacted.png','14-identity-redacted.png','15-identity-redacted.png',
  '16-identity-redacted.png','17-identity-redacted.png','18-identity-redacted.png','19-identity-redacted.png',
  '20-identity-redacted.png','21-identity-redacted.png','22-identity-redacted.png','23-identity-redacted.png',
  '24-identity-redacted.png','25-identity-redacted.png','26-identity-redacted.png','27-identity-redacted.png',
  '28-identity-redacted.png','29-identity-redacted.png','30-identity-redacted.png','31-identity-redacted.png',
  '32-identity-redacted.png','33-identity-redacted.png','34-identity-redacted.png','35-identity-redacted.png'
];

const featured = [
  ['12-identity-redacted.png','Shortlisted for an internship'],
  ['22-identity-redacted.png','A call and interview invitation'],
  ['05-identity-redacted.png','“Hire him!”'],
  ['07-identity-redacted.png','An invitation to chat'],
  ['08-identity-redacted.png','Forwarded to the hiring manager'],
  ['28-identity-redacted.png','“Nailed the DM”'],
  ['16-identity-redacted.png','“Nice pitch”'],
  ['18-identity-redacted.png','A direct introduction'],
  ['35-identity-redacted.png','Passed to HR'],
  ['14-identity-redacted.png','A salary conversation']
];
const featuredMap = new Map(featured);
const slides = [...featured.map(([file,label])=>({file,label})), ...allFiles.filter(file=>!featuredMap.has(file)).map(file=>({file,label:'A real reply'}))];
const timeline = [
  ...slides.slice(0,3).map((slide,index)=>({...slide,ordinal:index+1})),
  {clue:true,ordinal:3,label:'The video clue'},
  {secret:true,ordinal:3,label:'The original message'},
  ...slides.slice(3).map((slide,index)=>({...slide,ordinal:index+4}))
];

// Kept verbatim from the user's supplied outreach message.
const originalMessage = String.raw`REASONS why you SHOULDN'T HIRE me

Hey Siddharth
Manish here. I'd love to work with Kiwi as a Growth Intern
Here are some reasons you shouldn't hire me

1. I don't have a Formal Marketing degree
2. I tend to get obsessed with growth problems and Thalapathy Vijay
3. I cold emailed my way into most of my opportunities

Now, reasons you SHOULD hire me
1\)Scaled creator campaigns generating 5M+ organic views
2\)Managed ₹30K+/month Meta & YouTube ad budgets
3\) Built internal automations using Slack bots
4\) Drove ₹5L/month revenue impact and closed ₹1L+ in Brand deals

Attaching
Normal Resume (for people who like PDFs) -[https://tinyurl.com/52vwt9cf](https://tinyurl.com/52vwt9cf)
Interactive Resume (for people who don't) -[https://tinyurl.com/y9dzvmd2](https://tinyurl.com/y9dzvmd2)

Would love to see if there's a fit!`;

const $ = id => document.getElementById(id);
const deck = $('deck');
const activeCard = $('activeCard');
const clueCard = $('clueCard');
const replyImage = $('replyImage');
const secretCard = $('secretCard');
const nextCard = $('nextCard');
const form = $('messageForm');
let position = 0;
let busy = false;
let queuedSwipes = [];
let pointerStart = null;
let toastTimer = null;

function render() {
  const item = timeline[position];
  const isSecret = Boolean(item.secret);
  const isClue = Boolean(item.clue);
  activeCard.hidden = isSecret || isClue;
  clueCard.hidden = !isClue;
  secretCard.hidden = !isSecret;
  if (!isSecret && !isClue) {
    replyImage.src = `assets/screens/${item.file}`;
    replyImage.alt = `Redacted original screenshot, reply ${item.ordinal} of 35: ${item.label}`;
  }
  $('cardTitle').textContent = item.label;
  $('cardMeta').textContent = isSecret ? 'MESSAGE UNLOCKED' : isClue ? 'SWIPE TO REVEAL' : `${String(item.ordinal).padStart(2,'0')} of 35`;
  $('progressLabel').textContent = isSecret ? 'MESSAGE UNLOCKED' : isClue ? 'THE CLUE' : `REPLY ${String(item.ordinal).padStart(2,'0')} / 35`;
  $('progressHint').textContent = isSecret || item.ordinal > 3 ? 'treasure found' : isClue ? '1 swipe to reveal' : `${5-item.ordinal} swipes to reveal`;
  $('progressFill').style.width = `${isSecret || item.ordinal>3 ? 100 : isClue ? 80 : item.ordinal*20}%`;
  const next = timeline[position+1];
  const afterNext = timeline[position+2];
  $('nextPreview').hidden = !next || Boolean(next.secret);
  $('treasurePeek').hidden = !next?.secret;
  nextCard.classList.toggle('secret-next',Boolean(next?.secret));
  nextCard.classList.toggle('clue-next',Boolean(next?.clue));
  if (next?.file) $('nextPreview').src=`assets/screens/${next.file}`;
  else if (next?.clue) $('nextPreview').src='assets/vijay-poster.jpg';
  $('thirdPreview').hidden = !afterNext?.file;
  if (afterNext?.file) $('thirdPreview').src=`assets/screens/${afterNext.file}`;
  if (isClue) {
    $('clueVideo').currentTime=0;
    $('playClue').textContent='▶ Play with sound';
    $('clueVideo').muted=false;
    $('clueVideo').play().then(()=>$('playClue').textContent='↺ Replay with sound').catch(()=>{});
  } else $('clueVideo').pause();
  const atEnd = position === timeline.length-1;
  $('swipeLeft').innerHTML = atEnd ? '<span aria-hidden="true">↺</span> REPLAY' : '<span aria-hidden="true">←</span> SWIPE LEFT';
  $('swipeRight').innerHTML = atEnd ? 'REPLAY <span aria-hidden="true">↺</span>' : 'SWIPE RIGHT <span aria-hidden="true">→</span>';
  if (next && next.file) { const preload = new Image(); preload.src = `assets/screens/${next.file}`; }
}

function topCard(){return timeline[position].secret?secretCard:timeline[position].clue?clueCard:activeCard;}
function resetDrag(){
  const card=topCard();
  card.style.transition='transform .32s cubic-bezier(.18,.89,.25,1.3), opacity .32s';
  card.style.transform=''; card.style.opacity='';
  nextCard.style.transition='transform .32s ease, opacity .32s ease';
  nextCard.style.transform=''; nextCard.style.opacity='';
  deck.classList.remove('dragging','ready-to-toss');
}
function advance(direction) {
  if (busy) { queuedSwipes.push(direction); return; }
  if (position >= timeline.length-1) { queuedSwipes=[]; position=0; render(); window.scrollTo({top:0,behavior:'smooth'}); return; }
  busy = true;
  const card=topCard();
  deck.classList.remove('dragging','ready-to-toss');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    position++; render(); busy=false; if(timeline[position].secret)queuedSwipes=[];else if(queuedSwipes.length)advance(queuedSwipes.shift()); return;
  }
  const sign=direction==='left'?-1:1;
  card.style.transition='transform .33s cubic-bezier(.22,.8,.28,1), opacity .33s ease';
  card.style.transform=`translate3d(${sign*135}%,22px,0) rotate(${sign*22}deg) scale(.9)`;
  card.style.opacity='0';
  nextCard.style.transition='transform .33s cubic-bezier(.22,.8,.28,1),opacity .33s ease';
  nextCard.style.transform='translate3d(0,0,0) rotate(0deg) scale(1)';
  nextCard.style.opacity='1';
  window.setTimeout(()=>{
    card.style.transition=''; card.style.transform=''; card.style.opacity='';
    nextCard.style.transition=''; nextCard.style.transform=''; nextCard.style.opacity='';
    position++;
    render();
    if(timeline[position].secret)secretCard.scrollTop=0;
    busy=false;
    if(timeline[position].secret) queuedSwipes=[];
    else if(queuedSwipes.length) advance(queuedSwipes.shift());
  },330);
}

function notify(message){
  const toast=$('toast'); toast.textContent=message; toast.classList.add('show');
  window.clearTimeout(toastTimer); toastTimer=window.setTimeout(()=>toast.classList.remove('show'),2400);
}

async function copyText(value){
  try { await navigator.clipboard.writeText(value); notify('Copied to clipboard'); }
  catch {
    const input=document.createElement('textarea'); input.value=value; input.style.position='fixed'; input.style.opacity='0'; document.body.append(input); input.select();
    const done=document.execCommand('copy'); input.remove(); notify(done?'Copied to clipboard':'Select the message to copy it');
  }
}

function field(name){ const input=form.elements.namedItem(name); return input.value.trim() || input.placeholder; }
function buildTemplate(){
  return `REASONS why you SHOULDN'T HIRE me

Hey ${field('recipient')}
${field('sender')} here. I'd love to work with ${field('company')} as a ${field('role')}
Here are some reasons you shouldn't hire me

1. ${field('reason1')}
2. ${field('reason2')}
3. ${field('reason3')}

Now, reasons you SHOULD hire me
1) ${field('win1')}
2) ${field('win2')}
3) ${field('win3')}
4) ${field('win4')}

Attaching
Normal Resume (for people who like PDFs) - ${field('resume')}
Portfolio / interactive resume (for people who don't) - ${field('portfolio')}

Would love to see if there's a fit!`;
}

const examples = {
  growth:{recipient:'Aarav',sender:'Your Name',company:'Example Co.',role:'Growth Intern',reason1:'I learned growth by running experiments rather than following a formal marketing track',reason2:'I care a little too much about conversion drop-offs',reason3:'I made my first opportunities by reaching out directly',win1:'[Example: grew a newsletter from 0 to 2,000 subscribers]',win2:'[Example: managed a real campaign budget and measured CAC]',win3:'[Example: built an automated weekly reporting dashboard]',win4:'[Example: helped close a partnership that brought in new customers]',resume:'https://example.com/resume.pdf',portfolio:'https://example.com/portfolio'},
  design:{recipient:'Sam',sender:'Your Name',company:'Example Studio',role:'Product Designer',reason1:'I did not take a traditional design-school route',reason2:'I get obsessed with the smallest friction in a user flow',reason3:'I found early projects by sharing my work directly',win1:'[Example: redesigned onboarding after interviewing 12 users]',win2:'[Example: created a component library used across 3 teams]',win3:'[Example: built clickable prototypes and tested them weekly]',win4:'[Example: improved a real completion metric by a measured amount]',resume:'https://example.com/resume.pdf',portfolio:'https://example.com/portfolio'}
};

function loadExample(name){
  for(const input of form.elements) if(input.name) input.value=name==='blank'?'':(examples[name][input.name]||'');
  $('templateMessage').textContent=buildTemplate();
  notify(name==='blank'?'Blank template ready':'Example loaded — replace its details with yours');
}

$('originalMessage').textContent=originalMessage;
$('templateMessage').textContent=buildTemplate();
render();
$('swipeLeft').addEventListener('click',()=>advance('left'));
$('swipeRight').addEventListener('click',()=>advance('right'));
deck.addEventListener('pointerdown',event=>{
  if(busy||event.button!==0||event.target.closest('button'))return;
  pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};
  deck.setPointerCapture(event.pointerId);
});
deck.addEventListener('pointermove',event=>{
  if(!pointerStart||busy)return;
  const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;
  if(Math.abs(dx)<5&&Math.abs(dy)<5)return;
  if(Math.abs(dy)>Math.abs(dx)*1.4 && !deck.classList.contains('dragging'))return;
  event.preventDefault();
  deck.classList.add('dragging');
  const amount=Math.min(Math.abs(dx)/Math.max(deck.clientWidth*.35,120),1);
  const card=topCard();
  card.style.transition='none';card.style.opacity='1';
  card.style.transform=`translate3d(${dx}px,${dy*.12}px,0) rotate(${dx/18}deg) scale(${1-amount*.045})`;
  nextCard.style.transition='none';
  nextCard.style.transform=`translate3d(0,${8-amount*8}px,0) rotate(${-4+amount*4}deg) scale(${.94+amount*.06})`;
  nextCard.style.opacity=String(.65+amount*.35);
  deck.classList.toggle('ready-to-toss',Math.abs(dx)>Math.max(72,deck.clientWidth*.22));
});
deck.addEventListener('pointerup',event=>{
  if(!pointerStart)return;
  const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;
  pointerStart=null;
  if(deck.hasPointerCapture(event.pointerId))deck.releasePointerCapture(event.pointerId);
  if(Math.abs(dx)>Math.max(72,deck.clientWidth*.22)&&Math.abs(dx)>Math.abs(dy)*1.1)advance(dx<0?'left':'right');
  else resetDrag();
});
deck.addEventListener('pointercancel',()=>{pointerStart=null;resetDrag();});
document.addEventListener('keydown',event=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if($('videoDialog').open||$('imageDialog').open)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();advance(event.key==='ArrowLeft'?'left':'right');}});
$('expandImage').addEventListener('click',()=>{$('expandedImage').src=replyImage.src;$('expandedImage').alt=replyImage.alt;$('imageDialog').showModal();});
$('closeImage').addEventListener('click',()=>$('imageDialog').close());
$('imageDialog').addEventListener('click',event=>{if(event.target===$('imageDialog'))$('imageDialog').close();});
$('copyOriginal').addEventListener('click',()=>copyText(originalMessage));
$('showBuilder').addEventListener('click',()=>{$('builder').hidden=false;$('builder').scrollIntoView({behavior:'smooth',block:'start'});});
$('closeBuilder').addEventListener('click',()=>{$('builder').hidden=true;$('top').scrollIntoView({behavior:'smooth'});});
form.addEventListener('input',()=>$('templateMessage').textContent=buildTemplate());
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>loadExample(button.dataset.example)));
$('copyTemplate').addEventListener('click',()=>copyText(buildTemplate()));
$('playClue').addEventListener('click',()=>{$('clueVideo').currentTime=0;$('clueVideo').muted=false;$('clueVideo').play().then(()=>$('playClue').textContent='↺ Replay with sound').catch(()=>notify('Tap again to play the clip'));});
$('clueVideo').addEventListener('ended',()=>$('playClue').textContent='↺ Replay with sound');
$('openVideo').addEventListener('click',()=>{$('videoDialog').showModal();});
$('closeVideo').addEventListener('click',()=>{$('callbackVideo').pause();$('videoDialog').close();});
$('videoDialog').addEventListener('close',()=>$('callbackVideo').pause());
$('videoDialog').addEventListener('click',event=>{if(event.target===$('videoDialog'))$('videoDialog').close();});
