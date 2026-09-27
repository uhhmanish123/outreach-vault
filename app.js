const proof = [
  {file:'28-identity-redacted.png',quote:'“Firstly, nailed the DM. Love it.”'},
  {file:'31-identity-redacted.png',quote:'“Great header and quite interesting message.”'},
  {file:'16-identity-redacted.png',quote:'“Nice pitch.”'},
  {file:'34-identity-redacted.png',quote:'“A really good pitch!”'},
  {file:'24-identity-redacted.png',quote:'“Great message :)”'},
  {file:'21-identity-redacted.png',quote:'“Interesting pitch.”'},
  {file:'18-identity-redacted.png',quote:'“Cool shit man.”'},
  {file:'05-identity-redacted.png',quote:'“Hire him!”'},
  {file:'12-identity-redacted.png',quote:'Resume shortlisted'},
  {file:'22-identity-redacted.png',quote:'A call and possible interviews'},
  {file:'01b-linkedin-identity-redacted.png',quote:'A real reply'},
  {file:'02-identity-redacted.png',quote:'“Interesting.”'},
  {file:'04-identity-redacted.png',quote:'A follow-up conversation'},
  {file:'06-identity-redacted.png',quote:'Loved the portfolio and resume'},
  {file:'07-identity-redacted.png',quote:'Invited to chat'},
  {file:'08-identity-redacted.png',quote:'Forwarding to the hiring manager'},
  {file:'09-identity-redacted.png',quote:'“Good work with your CV.”'},
  {file:'10-identity-redacted.png',quote:'“Cool outreach.”'},
  {file:'13-identity-redacted.png',quote:'Asked to email the team'},
  {file:'14-identity-redacted.png',quote:'A salary conversation'},
  {file:'15-identity-redacted.png',quote:'“Love the energy.”'},
  {file:'17-identity-redacted.png',quote:'Appreciated the reach-out'},
  {file:'20-identity-redacted.png',quote:'Asked to send the work'},
  {file:'23-identity-redacted.png',quote:'A direct introduction'},
  {file:'26-identity-redacted.png',quote:'Another introduction'},
  {file:'29-identity-redacted.png',quote:'“Good pitch though!”'},
  {file:'30-identity-redacted.png',quote:'Asked to send an email'},
  {file:'32-identity-redacted.png',quote:'“Nice pitch.”'},
  {file:'33-identity-redacted.png',quote:'“Interesting interactive resume!”'},
  {file:'35-identity-redacted.png',quote:'Profile passed to HR'}
];

// The original message stays verbatim to establish what produced the replies.
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

const template = `REASONS why you SHOULDN'T HIRE me

Hey [first name]
[your name] here. I'd love to work with [company] as a [role].
Here are some reasons you shouldn't hire me:

1. [An honest detail about your nontraditional path]
2. [A specific interest or quirk that shows your personality]
3. [An initiative you took to create your own opportunities]

Now, reasons you SHOULD hire me:
1) [A relevant win with a real metric]
2) [A project or budget you owned, with its scale]
3) [A tool, process, or system you built]
4) [A business result or partnership you helped deliver]

Attaching
Resume: [link]
Portfolio or work samples: [link]

Would love to see if there's a fit!`;

const $ = id => document.getElementById(id);
const wheel = $('wheel');
const front = $('frontCard');
const second = $('secondCard');
let current = 0;
let phase = 'manual';
let pointer = null;
let animating = false;
let toastTimer = null;

const fullSrc = item => `assets/screens/${item.file}`;
const thumbSrc = item => `assets/thumbs/${item.file.replace(/\.png$/,'.webp')}`;

function fillProofWall(){
  const wall = $('receiptWall');
  const grid = $('proofGrid');
  proof.forEach((item,index)=>{
    const wallImage = document.createElement('img');
    wallImage.src = thumbSrc(item);
    wallImage.alt = '';
    wallImage.loading = 'eager';
    wall.append(wallImage);

    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'proof-tile';
    tile.setAttribute('aria-label',`Expand reply ${index+1}: ${item.quote}`);
    const image = document.createElement('img');
    image.src = thumbSrc(item);
    image.alt = '';
    image.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = item.quote;
    tile.append(image,label);
    tile.addEventListener('click',()=>openImage(item));
    grid.append(tile);
  });
}

function showManualCard(){
  const item=proof[current];
  $('frontImage').src=fullSrc(item);
  $('frontImage').alt=`Redacted original conversation: ${item.quote}`;
  $('captionQuote').textContent=item.quote;
  $('secondImage').src=thumbSrc(proof[current+1]);
  $('thirdImage').src=thumbSrc(proof[current+2]);
  front.style.transition='';front.style.transform='';front.style.opacity='';
  second.style.transition='';second.style.transform='';second.style.opacity='';
  front.hidden=false;
}

function resetPull(){
  front.style.transition='transform .35s cubic-bezier(.18,.92,.25,1.28),opacity .35s';
  front.style.transform='';front.style.opacity='';
  second.style.transition='transform .35s ease';second.style.transform='';
  wheel.classList.remove('dragging','ready');
}

function toss(direction){
  if(phase!=='manual'||animating)return;
  animating=true;
  const sign=direction==='left'?-1:1;
  wheel.classList.remove('dragging','ready');
  front.style.transition='transform .36s cubic-bezier(.25,.85,.25,1),opacity .36s ease';
  front.style.transform=`translate3d(${sign*145}%,18px,0) rotate(${sign*24}deg) scale(.88)`;
  front.style.opacity='0';
  second.style.transition='transform .36s ease';
  second.style.transform='translate(0,0) rotate(0) scale(1)';
  window.setTimeout(()=>{
    current++;
    animating=false;
    if(current<3)showManualCard();
    else {front.hidden=true;startCascade();}
  },360);
}

function startCascade(){
  phase='cascade';
  $('cinematicStatus').hidden=false;
  $('gestureHelp').hidden=true;
  $('deckCaption').hidden=true;
  wheel.classList.add('cascading');
  second.hidden=true;
  document.querySelector('.stack-third').hidden=true;
  const remaining=proof.slice(3);
  const interval=64;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){revealMessage();return;}
  remaining.forEach((item,index)=>{
    window.setTimeout(()=>{
      const image=document.createElement('img');
      image.className='burst-card';
      image.src=thumbSrc(item);
      image.alt='';
      const sign=index%2===0?-1:1;
      image.style.setProperty('--fly-x',`${sign*(window.innerWidth*.65+130)}px`);
      image.style.setProperty('--fly-y',`${((index%7)-3)*32}px`);
      image.style.setProperty('--turn',`${sign*(20+index%5*7)}deg`);
      $('burstLayer').append(image);
      window.setTimeout(()=>image.remove(),780);
    },index*interval);
  });
  window.setTimeout(revealMessage,remaining.length*interval+650);
}

function revealMessage(){
  phase='revealed';
  $('reveal').hidden=false;
  $('intro').classList.add('complete');
  $('cinematicStatus').textContent='Message unlocked.';
  $('reveal').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}

function openImage(item){
  $('expandedImage').src=fullSrc(item);
  $('expandedImage').alt=`Expanded redacted reply: ${item.quote}`;
  $('imageDialog').showModal();
}

function notify(message){
  const toast=$('toast');toast.textContent=message;toast.classList.add('show');
  window.clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>toast.classList.remove('show'),2400);
}
async function copyText(value){
  try{await navigator.clipboard.writeText(value);notify('Copied to clipboard');}
  catch{const box=document.createElement('textarea');box.value=value;box.style.position='fixed';box.style.opacity='0';document.body.append(box);box.select();const done=document.execCommand('copy');box.remove();notify(done?'Copied to clipboard':'Select the message to copy it');}
}

fillProofWall();
showManualCard();
$('originalText').textContent=originalMessage;
$('templateText').value=template;
$('expandCard').addEventListener('click',()=>openImage(proof[current]));
$('closeImage').addEventListener('click',()=>$('imageDialog').close());
$('imageDialog').addEventListener('click',event=>{if(event.target===$('imageDialog'))$('imageDialog').close();});
$('copyOriginal').addEventListener('click',()=>copyText(originalMessage));
$('copyTemplate').addEventListener('click',()=>copyText($('templateText').value));

wheel.addEventListener('pointerdown',event=>{
  if(phase!=='manual'||animating||event.button!==0||event.target.closest('button'))return;
  pointer={x:event.clientX,y:event.clientY,id:event.pointerId};
  wheel.setPointerCapture(event.pointerId);
});
wheel.addEventListener('pointermove',event=>{
  if(!pointer||phase!=='manual'||animating)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  if(Math.abs(dx)<5&&Math.abs(dy)<5)return;
  if(Math.abs(dy)>Math.abs(dx)*1.4&&!wheel.classList.contains('dragging'))return;
  event.preventDefault();wheel.classList.add('dragging');
  const pressure=Math.min(Math.abs(dx)/Math.max(wheel.clientWidth*.34,100),1);
  front.style.transition='none';front.style.opacity='1';
  front.style.transform=`translate3d(${dx}px,${dy*.13}px,0) rotate(${dx/17}deg) scale(${1-pressure*.05})`;
  second.style.transition='none';
  second.style.transform=`translate(0,${7-pressure*7}px) rotate(${-4+pressure*4}deg) scale(${.96+pressure*.04})`;
  wheel.classList.toggle('ready',Math.abs(dx)>Math.max(70,wheel.clientWidth*.22));
});
wheel.addEventListener('pointerup',event=>{
  if(!pointer)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  pointer=null;
  if(wheel.hasPointerCapture(event.pointerId))wheel.releasePointerCapture(event.pointerId);
  if(Math.abs(dx)>Math.max(70,wheel.clientWidth*.22)&&Math.abs(dx)>Math.abs(dy)*1.1)toss(dx<0?'left':'right');
  else resetPull();
});
wheel.addEventListener('pointercancel',()=>{pointer=null;resetPull();});
document.addEventListener('keydown',event=>{
  if(phase!=='manual'||$('imageDialog').open||['TEXTAREA','INPUT'].includes(document.activeElement?.tagName))return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();toss(event.key==='ArrowLeft'?'left':'right');}
});
