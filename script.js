'use strict';
// Reveal transitions are opt-in: never hide page content when JS cannot run.
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-enabled');
}
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const toggle=$('#menuToggle'),nav=$('#mainNav');
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');nav.inert=true;}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);nav.inert=!open;});
$$('.nav-panel a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))closeMenu()});
const backTop=$('#backTop');window.addEventListener('scroll',()=>backTop.classList.toggle('visible',scrollY>550),{passive:true});backTop.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
// Motion is progressive enhancement. Nothing is hidden before JavaScript executes.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const revealItems=$$('.reveal');
if('IntersectionObserver' in window&&!reducedMotion.matches){
  const seen=new WeakSet();
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      const el=entry.target;
      if(entry.isIntersecting){
        el.classList.add('in-view');
        // A new entrance after scrolling away triggers a new gentle reveal.
        if(seen.has(el) && typeof el.animate==='function'){
          const isPhoto=el.matches('.hero-image,.about-photo,.interview,.gallery-item');
          el.animate(
            isPhoto ? [{opacity:.55,filter:'brightness(.75)'},{opacity:1,filter:'brightness(1)'}]
                    : [{opacity:.45,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
            {duration:isPhoto?700:560,easing:'cubic-bezier(.22,.8,.3,1)',iterations:1}
          );
        }
        seen.add(el);
      }else{
        el.classList.remove('in-view');
      }
    }
  },{threshold:.06,rootMargin:'0px 0px -5% 0px'});
  revealItems.forEach(el=>observer.observe(el));
}else revealItems.forEach(el=>el.classList.add('in-view'));
// A slight cinematic darkening of the opening portrait as it scrolls out, no zoom.
const heroPhoto=$('.hero-image');
let scrollFrame=0;
function updateHeroShade(){
  scrollFrame=0;
  if(!heroPhoto)return;
  if(reducedMotion.matches){heroPhoto.style.setProperty('--hero-scroll-shade','0');return}
  const hero=$('.hero');
  const rect=hero.getBoundingClientRect();
  const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height*0.82)));
  heroPhoto.style.setProperty('--hero-scroll-shade',String((progress*0.27).toFixed(3)));
}
window.addEventListener('scroll',()=>{
  if(!scrollFrame)scrollFrame=requestAnimationFrame(updateHeroShade);
},{passive:true});
window.addEventListener('resize',updateHeroShade,{passive:true});
reducedMotion.addEventListener?.('change',updateHeroShade);
updateHeroShade();
const toast=$('#toast');let toastTimer;function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
$('#share').addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);notify('Ссылка скопирована')}else notify('Скопируйте адрес из браузера')}catch(e){if(e.name!=='AbortError')notify('Не удалось поделиться')}});
const photos=[2,3,5,6,7,8],captions=['Музыка','За кадром','События','Творчество','Живи. Люби. Твори.','Люди и истории'];let photoIndex=0;const modal=$('#lightbox');function showPhoto(idx){photoIndex=(idx+photos.length)%photos.length;$('#lightboxImg').src=`assets/photo-${photos[photoIndex]}.webp`;$('#lightboxImg').alt=captions[photoIndex];$('#lightboxCaption').textContent=`${photoIndex+1} / ${photos.length} — ${captions[photoIndex]}`;}$$('.gallery-item').forEach(b=>b.addEventListener('click',()=>{showPhoto(photos.indexOf(Number(b.dataset.image)));modal.showModal()}));$('#closeLightbox').addEventListener('click',()=>modal.close());$('#prevImage').addEventListener('click',()=>showPhoto(photoIndex-1));$('#nextImage').addEventListener('click',()=>showPhoto(photoIndex+1));modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});document.addEventListener('keydown',e=>{if(!modal.open)return;if(e.key==='ArrowRight')showPhoto(photoIndex+1);if(e.key==='ArrowLeft')showPhoto(photoIndex-1)});

let touchStartX=0;modal.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].screenX},{passive:true});modal.addEventListener('touchend',e=>{const distance=e.changedTouches[0].screenX-touchStartX;if(Math.abs(distance)>55)showPhoto(photoIndex+(distance<0?1:-1))},{passive:true});
