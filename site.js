/* Motion layer – progressive enhancement, first-party only. */
(function(){
  var d=document,root=d.documentElement;root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar=d.createElement('div');bar.className='scroll-progress';bar.setAttribute('aria-hidden','true');d.body.appendChild(bar);
  function onScroll(){var h=root.scrollHeight-innerHeight;bar.style.setProperty('--p',h>0?Math.min(1,scrollY/h):0)}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  d.querySelectorAll('main section:not(.hero) h2, main section:not(.hero) .lead, main section:not(.hero) .lede, main .section-dark, main .faq, main .table-wrap, main form, .about, .about-copy').forEach(function(el){el.classList.add('reveal')});
  d.querySelectorAll('main .grid-3, main .grid-2, main .cards, main .steps, main .list-check, main .who-list, main .price-grid, main .timeline, main .timeline-14, main .situations, main .example-grid, main .phones').forEach(function(el){el.classList.add('reveal-stagger')});
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    d.querySelectorAll('.reveal,.reveal-stagger').forEach(function(el){io.observe(el)});
  } else {d.querySelectorAll('.reveal,.reveal-stagger').forEach(function(el){el.classList.add('in')})}
  var stage=d.querySelector('.stage'), panel=d.querySelector('.stage-panel');
  if(stage&&panel&&!reduce&&matchMedia('(pointer:fine)').matches){
    stage.addEventListener('pointermove',function(e){var r=stage.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;panel.style.transform='rotateY('+(x*10)+'deg) rotateX('+(-y*8)+'deg)'});
    stage.addEventListener('pointerleave',function(){panel.style.transform=''});
  }
  var cv=d.querySelector('.stage-canvas');
  if(cv&&cv.getContext){
    var ctx=cv.getContext('2d'),W,H,DPR=Math.min(2,devicePixelRatio||1);
    var words=['REC', 'Reel', 'UGC', 'klipp', 'post', 'NO', 'ES', 'video', 'snutt', 'AI']; var cols=['#B8430B', '#F2C14E', '#ea580c'];
    var N=innerWidth<700?18:34,P=[];
    for(var i=0;i<N;i++)P.push({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random(),w:words[i%words.length],c:cols[i%cols.length]});
    var mx=0,my=0;addEventListener('pointermove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
    function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}
    size();addEventListener('resize',size);
    var visible=true;if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting}).observe(cv);
    function frame(){if(visible){ctx.clearRect(0,0,W,H);P.sort(function(a,b){return a.z-b.z});P.forEach(function(p){if(!reduce){p.z+=0.0015;if(p.z>1){p.z=0;p.x=Math.random()*2-1;p.y=Math.random()*2-1}}var s=.35+p.z*1.4;var x=W/2+(p.x*W*.5+mx*50*p.z)*s*.8;var y=H/2+(p.y*H*.5+my*35*p.z)*s*.8;ctx.globalAlpha=Math.sin(p.z*Math.PI)*.55;ctx.fillStyle=p.c;ctx.font='900 '+Math.round(12+p.z*32)+'px "Arial Black",Helvetica,sans-serif';ctx.fillText(p.w,x,y)})}if(!reduce)requestAnimationFrame(frame)}
    frame();
  }
})();
