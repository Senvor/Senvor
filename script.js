(function(){
  var tree=document.getElementById('tree'),trait=document.getElementById('trait');
  var TRAITS=['Quick learner','Night owl','Stubborn','Lucky','Curious','Steady hands','Restless','Cheerful'];
  var line=[],counter=0;
  function rnd(n){return Math.floor(Math.random()*n)}
  function first(){
    var bits=[];for(var i=0;i<32;i++)bits.push(Math.random()<.5);
    return {bits:bits,hue:rnd(360),trait:TRAITS[rnd(TRAITS.length)],founder:true};
  }
  function child(p){
    var bits=p.bits.map(function(b){return Math.random()<.12?!b:b});
    var mutated=false;
    var hue=(p.hue+rnd(41)-20+360)%360;
    var t=p.trait;
    if(Math.random()<.35){t=TRAITS[rnd(TRAITS.length)];mutated=true}
    return {bits:bits,hue:hue,trait:t,mutated:mutated};
  }
  function draw(c,g){
    var x=c.getContext('2d');x.clearRect(0,0,8,8);
    x.fillStyle='hsl('+g.hue+' 70% 58%)';
    for(var y=0;y<8;y++)for(var i=0;i<4;i++){
      if(g.bits[y*4+i]){x.fillRect(i,y,1,1);x.fillRect(7-i,y,1,1)}
    }
    x.fillStyle='#1b1840';x.fillRect(2,3,1,1);x.fillRect(5,3,1,1);
  }
  var sel=0;
  function describe(g){
    if(g.founder)return 'Gen '+g.n+' starts a new line: '+g.trait.toLowerCase()+'.';
    return g.mutated?'Gen '+g.n+' mutated: now '+g.trait.toLowerCase()+'.':'Gen '+g.n+' inherited: '+g.trait.toLowerCase()+'.';
  }
  // Tapping a creature shows its details without rebuilding (and re-animating) the whole tree.
  function select(idx){
    sel=idx;
    var kids=tree.children;
    for(var i=0;i<kids.length;i++)kids[i].classList.toggle('sel',i===idx);
    var g=line[idx];
    trait.textContent=describe(g)+' Colour hue '+g.hue+'°.';
  }
  function render(mode){
    tree.innerHTML='';
    line.forEach(function(g,idx){
      var d=document.createElement('div');d.className='gen';
      if(mode==='intro'){d.className+=' intro';d.style.setProperty('--i',idx)}
      if(mode==='new'){
        if(idx===line.length-1)d.className+=' new'+(g.mutated?' mut':'');
        else if(idx===line.length-2)d.className+=' linking';
      }
      var c=document.createElement('canvas');c.width=8;c.height=8;
      c.setAttribute('role','button');c.tabIndex=0;
      c.setAttribute('aria-label','Generation '+g.n+', trait: '+g.trait+'. Press to inspect.');
      draw(c,g);
      c.addEventListener('click',function(){select(idx)});
      c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();select(idx)}});
      var s=document.createElement('small');s.textContent='Gen '+g.n;
      d.appendChild(c);d.appendChild(s);tree.appendChild(d);
    });
    sel=line.length-1;
    tree.lastChild.classList.add('sel');
    trait.textContent=describe(line[sel]);
  }
  function add(g){g.n=++counter;line.push(g);if(line.length>6)line.shift()}
  function startLine(){line=[];counter=0;add(first());add(child(line[0]));add(child(line[1]))}
  startLine();
  render('intro');
  document.getElementById('next').addEventListener('click',function(){add(child(line[line.length-1]));render('new')});
  document.getElementById('reset').addEventListener('click',function(){
    startLine();
    tree.style.setProperty('--b','0s');   // fresh creatures pop in straight away instead of after the page-load delay
    render('intro');
  });
  // Save the selected creature as a crisp 256x256 PNG (8x8 pixels scaled up with no smoothing).
  document.getElementById('save').addEventListener('click',function(){
    var g=line[sel];if(!g)return;
    var small=document.createElement('canvas');small.width=small.height=8;draw(small,g);
    var big=document.createElement('canvas');big.width=big.height=256;
    var x=big.getContext('2d');x.imageSmoothingEnabled=false;
    x.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--chip').trim()||'#e6e2ff';
    x.fillRect(0,0,256,256);x.drawImage(small,0,0,256,256);
    big.toBlob(function(blob){
      var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='senvor-bloodline-gen-'+g.n+'.png';
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
      if(window.senvorToast)window.senvorToast('Saved Gen '+g.n+' as a PNG');
    });
  });

  // Icons taken from pixelarticons (https://github.com/halfmage/pixelarticons), MIT License, (c) 2019 Gerrit Halfmann.
  // Every icon is drawn on pixelarticons' 24x24 grid (one art pixel = 2 units), so they all share one viewBox and scale together.
  var RAW={
    code:'<path d="M5 4h4v2H5zm14 0h-4v2h4zM5 20h4v-2H5zm14 0h-4v-2h4zM3 6h2v12H3zm18 0h-2v12h2zm-10 5h2v2h-2zm-4 0h2v2H7zm8 0h2v2h-2z"/>',
    web:'<path d="M6 2h12v2H6zm0 18h12v2H6zM4 4h2v2H4zm5 0h2v2H9zm0 14h2v2H9zm4 0h2v2h-2zM7 6h2v12H7zm8 0h2v12h-2zm-2-2h2v2h-2zm7 0h-2v2h2zM2 6h2v12H2zm20 0h-2v12h2zM4 18h2v2H4zm16 0h-2v2h2z"/><path d="M3 11h18v2H3z"/>',
    css:'<path d="M2 2h20v2h-20zM2 4h2v2h-2zM20 4h2v2h-2zM2 6h2v2h-2zM8 6h8v2h-8zM20 6h2v2h-2zM2 8h2v2h-2zM14 8h2v2h-2zM20 8h2v2h-2zM2 10h2v2h-2zM10 10h6v2h-6zM20 10h2v2h-2zM2 12h2v2h-2zM14 12h2v2h-2zM20 12h2v2h-2zM4 14h2v2h-2zM8 14h8v2h-8zM18 14h2v2h-2zM4 16h2v2h-2zM18 16h2v2h-2zM6 18h2v2h-2zM16 18h2v2h-2zM8 20h8v2h-8z"/>',
    js:'<path d="M6 4h4v2H6zm12 0h-4v2h4zM6 20h4v-2H6zm12 0h-4v-2h4zM4 6h2v5H4zm16 0h-2v5h2zM4 18h2v-5H4zm16 0h-2v-5h2zM2 11h2v2H2zm20 0h-2v2h2z"/>',
    java:'<path d="M4 4h16v2H4zm0 2h2v8H4zm2 8h10v2H6zm14-8h2v4h-2zm-2 4h2v2h-2zm-2-4h2v8h-2zM2 18h18v2H2z"/>',
    godot:'<path d="M4 4h16v2H4zm0 14h16v2H4zM2 6h2v12H2zm18 0h2v12h-2zM8 9h2v6H8z"/><path d="M6 11h6v2H6zm8-2h2v2h-2zm2 4h2v2h-2z"/>',
    py:'<path d="M4 20H20V22H2V18H4V20ZM8 8H12V12H14V4H16V12H18V16H20V8H22V20H20V18H4V14H6V16H16V14H6V12H10V10H6V8H4V6H6V4H8V8ZM4 10H2V8H4V10ZM4 6H2V4H4V6ZM12 6H10V4H8V2H14V4H12V6Z"/>',
    cpp:'<path d="M7 3h2v2H7zm8 10h2v2h-2zM5 5h2v4H5zm8 10h2v4h-2zM9 5h2v4H9zm8 10h2v4h-2zM7 9h2v2H7zm8 10h2v2h-2zM13 3h4v2h-4zM5 13h4v2H5zm10-8h2v4h-2zM7 15h2v4H7zm6-6h6v2h-6zM5 19h6v2H5z"/>',
    board:'<path d="M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zM8 6h2v2H8zm8 12h-2v-2h2zM6 8h2v2H6zm12 8h-2v-2h2zM8 10h2v2H8zm8 4h-2v-2h2zm-6-6h6v2h-6zm4 8H8v-2h6zm2-12h2v4h-2zM8 20H6v-4h2z"/>',
    cpu:'<path d="M4 4h16v2H4zM4 18h16v2H4zM4 6h2v12H4zM18 6h2v12h-2zM8 8h8v2H8zM8 14h8v2H8zM8 10h2v4H8zM14 10h2v4h-2zM7 2h2v2H7zM11 2h2v2h-2zM15 2h2v2h-2zM7 20h2v2H7zM11 20h2v2h-2zM15 20h2v2h-2zM2 7h2v2H2zM2 11h2v2H2zM2 15h2v2H2zM20 7h2v2h-2zM20 11h2v2h-2zM20 15h2v2h-2z"/>',
    zap:'<path d="M4 13h8v6h2v2h-2v2h-2v-8H2v-4h2v2Zm12 6h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-6-6h8v4h-2v-2h-8V5h-2V3h2V1h2v8Zm-8 2H4V9h2v2Zm2-2H6V7h2v2Zm2-2H8V5h2v2Z"/>',
    brush:'<path d="M5 2h12v2H5zm0 2h2v10H5zm12-2h2v12h-2z"/><path d="M13 2h2v6h-2zM9 2h2v4H9zm-4 8h14v2H5zm0 4h14v2H5zm4 2h2v4H9zm4 0h2v4h-2zm-4 4h6v2H9z"/>',
    shapes:'<path d="M2 13h9v2H2zm0 2h2v5H2zm0 5h9v2H2zm7-5h2v5H9zm6-2h5v2h-5zm-2 2h2v5h-2zm2 5h5v2h-5zm5-5h2v5h-2zM7 9h10v2H7zm0-2h2v2H7zm2-3h2v3H9zm2-2h2v2h-2zm2 2h2v3h-2zm2 3h2v2h-2z"/>',
    window:'<path d="M4 3h16v2H4zm0 16h16v2H4zM2 5h2v14H2zm18 0h2v14h-2zM4 7h16v2H4zm8-2h2v2h-2zm4 0h2v2h-2z"/>',
    games:'<path d="M4 14h16v2H4zm0 6h16v2H4zm-2-4h2v4H2zm18 0h2v4h-2zM10 2h4v2h-4zM8 4h2v4H8zm6 0h2v4h-2zm-4 4h4v2h-4zm1 2h2v4h-2zm-4 2h2v2H7z"/>',
    ghost:'<path d="M8 2h8v2h-8zM6 4h2v2h-2zM16 4h2v2h-2zM4 6h2v2h-2zM18 6h2v2h-2zM4 8h2v2h-2zM8 8h2v2h-2zM14 8h2v2h-2zM18 8h2v2h-2zM2 10h2v2h-2zM8 10h2v2h-2zM14 10h2v2h-2zM20 10h2v2h-2zM2 12h2v2h-2zM20 12h2v2h-2zM2 14h2v2h-2zM20 14h2v2h-2zM2 16h2v2h-2zM20 16h2v2h-2zM2 18h2v2h-2zM6 18h2v2h-2zM16 18h2v2h-2zM20 18h2v2h-2zM2 20h4v2h-4zM8 20h8v2h-8zM18 20h4v2h-4z"/>',
    scissors:'<path d="M5 2h4v2H5zm0 12h4v2H5zm0-6h4v2H5zm0 12h4v2H5zM3 4h2v4H3zm0 12h2v4H3zM9 4h2v4H9zm0 12h2v4H9zm0-8h2v2H9zm2 2h2v2h-2zm-2 4h2v2H9zm2-2h2v2h-2zm2-2h2v2h-2zm2 4h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zM15 8h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2z"/>',
    usb:'<path d="M19 22H5V20H19V22ZM7 13H17V4H19V13H21V20H19V15H5V20H3V13H5V4H7V13ZM11 11H9V6H11V11ZM15 11H13V6H15V11ZM17 4H7V2H17V4Z"/>'
  };
  function ic(n){return'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges" fill="currentColor">'+RAW[n]+'</svg>'}
  function tag(sel,map){document.querySelectorAll(sel).forEach(function(el){var k=el.textContent.trim();if(map[k])el.insertAdjacentHTML('afterbegin',ic(map[k]))})}
  tag('.group',{Hardware:'cpu',Web:'window',Games:'games'});
  tag('.sg',{Code:'code',Hardware:'cpu',Design:'brush'});
  tag('.chips li',{HTML:'web',CSS:'css',JavaScript:'js',Java:'java',GDScript:'godot',Python:'py','C++':'cpp',Aseprite:'ghost',Canva:'shapes',CapCut:'scissors',KiCad:'board',Arduino:'usb',EasyEDA:'zap'});

  // Discord profile links need a numeric user ID, so instead of linking, these copy the username.
  document.querySelectorAll('[data-copy]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      var text=a.getAttribute('data-copy'),t=a.querySelector('span')||a,old=t.textContent;
      function done(){
        t.setAttribute('aria-live','polite');t.textContent='Copied!';
        setTimeout(function(){t.textContent=old},1500);
      }
      function fallback(){
        var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');
        ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
        var ok=false;try{ok=document.execCommand('copy')}catch(err){}
        document.body.removeChild(ta);
        if(ok)done();else window.open(a.href,'_blank','noopener');
      }
      if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(done,fallback);
      else fallback();
    });
  });

  // Scroll reveal: each project card steps in the first time it scrolls into view.
  // Cards that arrive together are staggered slightly so they cascade instead of popping at once.
  if('IntersectionObserver' in window){
    var cards=document.querySelectorAll('.proj');
    var io=new IntersectionObserver(function(entries){
      var n=0;
      entries.forEach(function(en){
        if(!en.isIntersecting)return;
        en.target.style.setProperty('--d',(n++*0.08)+'s');
        en.target.classList.add('in');
        io.unobserve(en.target);   // animate once, then stop watching
      });
    },{threshold:0.12});
    cards.forEach(function(c){c.classList.add('reveal');io.observe(c)});
  }

  var root=document.documentElement,btn=document.getElementById('theme');
  btn.addEventListener('click',function(){
    var dark=getComputedStyle(root).getPropertyValue('--bg').trim()==='#15132b';
    var next=dark?'light':'dark';
    function apply(){
      root.setAttribute('data-theme',next);
      try{localStorage.setItem('theme',next)}catch(e){}
    }
    var calm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(document.startViewTransition&&!calm){
      document.startViewTransition(apply);       // browser cross-fades a snapshot of the old page into the new one
    }else if(calm){
      apply();                                    // reduced motion: switch instantly
    }else{
      root.classList.add('fade');                 // older browsers: fade the colours instead
      apply();
      setTimeout(function(){root.classList.remove('fade')},350);
    }
  });
})();

// ---------- Toast (small pixel notification) ----------
(function(){
  var el=null,timer;
  window.senvorToast=function(msg){
    if(!el){el=document.createElement('div');el.className='toast';el.setAttribute('role','status');document.body.appendChild(el)}
    el.textContent=msg;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
    clearTimeout(timer);timer=setTimeout(function(){el.classList.remove('show')},2400);
  };
})();

// ---------- Pocket Gravity Lab: gravity sandbox ----------
// Every body is pulled by every sun (and, with "Planets pull each other" on, by every other planet) with the
// inverse-square law a = GM / r^2. Motion is stepped with leapfrog (kick-drift-kick), which keeps orbits
// stable for a long time. Physics runs in a 240x135 world; drawing scales it to the screen at full sharpness.
(function(){
  var cv=document.getElementById('orbit');if(!cv||!cv.getContext)return;
  var box=cv.parentNode,ctx=cv.getContext('2d'),W=240,H=135,cx=W/2,cy=H/2;
  var MAX=24,SOFT=30,SOFTP=6,PX=1;
  var $=function(id){return document.getElementById(id)};
  var pauseBtn=$('orbit-pause'),gIn=$('og'),sIn=$('os'),mIn=$('om'),tIn=$('ot'),pIn=$('op'),fsBtn=$('orbit-fs');
  var bodies=[],suns=[],bg=[],flashes=[],paused=false,onScreen=true,lastT=0,raf=0,scale=1,aim=null,time=0,simT=0;
  var zoom=1,camX=120,camY=67.5,ZMIN=0.25,ZMAX=12,G=1,warp=1,mutual=false,trails=true,preset='solar',binary=null,phase=0;
  var amber='#ffb84d',sky='#6ec1ff';
  function readColors(){var s=getComputedStyle(document.documentElement);amber=s.getPropertyValue('--amber').trim()||amber;sky=s.getPropertyValue('--sky').trim()||sky}
  readColors();
  new MutationObserver(function(){readColors();if(paused)draw()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    // Deliberately low-res: a 480x270 buffer blown up with crisp pixels (CSS image-rendering: pixelated).
    cv.width=W*PX;cv.height=H*PX;scale=PX;ctx.imageSmoothingEnabled=false;draw();
  }
  for(var i=0;i<80;i++)bg.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()<.8?.45:.9,p:Math.random()*6.28,s:.5+Math.random()*1.5});

  function totalGM(){var t=0;suns.forEach(function(s){t+=s.gm});return t*G}
  function add(x,y,vx,vy,size,hue,comet){
    var s=size||(2.4+Math.random()*1.8);
    bodies.push({x:x,y:y,vx:vx,vy:vy,size:s,gm:40*s*s*s,hue:hue==null?Math.floor(Math.random()*360):hue,trail:[],comet:!!comet,ax:0,ay:0});
    if(bodies.length>MAX)bodies.shift();
  }
  // Circular-orbit launch around the centre of mass of the suns.
  function launch(x,y,spin,speed,size,hue,comet){
    var dx=x-cx,dy=y-cy,r=Math.max(Math.sqrt(dx*dx+dy*dy),14);
    var v=Math.sqrt(totalGM()/r)*(speed||(0.85+Math.random()*0.25)),sp=spin||1;
    add(x,y,-dy/r*v*sp,dx/r*v*sp,size,hue,comet);
  }
  function placeSuns(){
    if(!binary)return;
    var a=phase;suns[0].x=cx+Math.cos(a)*binary.d;suns[0].y=cy+Math.sin(a)*binary.d;
    suns[1].x=cx-Math.cos(a)*binary.d;suns[1].y=cy-Math.sin(a)*binary.d;
  }
  function load(name){
    preset=name;bodies=[];flashes=[];simT=0;binary=null;phase=0;aim=null;
    if(name==='binary'){
      suns=[{x:0,y:0,gm:20000,r:4.5,hue:38},{x:0,y:0,gm:20000,r:4.5,hue:200}];
      binary={d:8,w:Math.sqrt(40000*G/Math.pow(16,3))};placeSuns();
      launch(cx+48,cy,1,1,2.4,20);launch(cx-72,cy,1,1,3.2,150);launch(cx+100,cy,1,1,2.6,300);
    }else{
      suns=[{x:cx,y:cy,gm:40000,r:6,hue:38}];
      if(name==='solar'){
        launch(cx+20,cy,1,1,2.2,20);launch(cx-31,cy,1,1,2.9,190);launch(cx,cy+44,1,1,3.4,130);
        launch(cx,cy-60,1,1,4.2,30);launch(cx+108,cy,1,0.42,1.6,200,true);
      }else if(name==='moon'){
        launch(cx+50,cy,1,1,6,210);var p=bodies[0];
        var vm=Math.sqrt(p.gm*G/10);add(p.x-10,p.y,p.vx,p.vy-vm,1.5,0);
      }else if(name==='chaos'){
        for(var k=0;k<12;k++){var a=Math.random()*6.283,d=22+Math.random()*48;launch(cx+Math.cos(a)*d*1.5,cy+Math.sin(a)*d,1,0.7+Math.random()*0.5)}
      }
    }
    mutual=(name==='moon'||name==='chaos');if(mIn)mIn.checked=mutual;
    accel();draw();
  }
  function accel(){
    for(var i=0;i<bodies.length;i++){
      var b=bodies[i],ax=0,ay=0;
      for(var j=0;j<suns.length;j++){
        var s=suns[j],dx=s.x-b.x,dy=s.y-b.y,r2=dx*dx+dy*dy+SOFT,inv=s.gm*G/(r2*Math.sqrt(r2));ax+=dx*inv;ay+=dy*inv;
      }
      if(mutual)for(var k=0;k<bodies.length;k++){
        if(k===i)continue;var o=bodies[k],ex=o.x-b.x,ey=o.y-b.y,q2=ex*ex+ey*ey+SOFTP,iv=o.gm*G/(q2*Math.sqrt(q2));ax+=ex*iv;ay+=ey*iv;
      }
      b.ax=ax;b.ay=ay;
    }
  }
  function step(dt){
    var i;
    for(i=0;i<bodies.length;i++){var b=bodies[i];b.vx+=b.ax*dt/2;b.vy+=b.ay*dt/2;b.x+=b.vx*dt;b.y+=b.vy*dt}
    simT+=dt;if(binary)phase+=binary.w*dt;placeSuns();accel();
    for(i=0;i<bodies.length;i++){var c=bodies[i];c.vx+=c.ax*dt/2;c.vy+=c.ay*dt/2}
    // swallowed by a sun, or escaped far away
    for(i=bodies.length-1;i>=0;i--){
      var d=bodies[i],gone=false;
      suns.forEach(function(s){var dx=d.x-s.x,dy=d.y-s.y;if(dx*dx+dy*dy<(s.r+d.size*.5)*(s.r+d.size*.5)){gone=true;flashes.push({x:s.x,y:s.y,t:0,hue:d.hue})}});
      if(!gone&&(Math.abs(d.x-cx)>W*2.5||Math.abs(d.y-cy)>W*2.5))gone=true;
      if(gone)bodies.splice(i,1);
    }
    // planets that touch merge, keeping their momentum
    if(mutual)for(i=0;i<bodies.length;i++)for(var j=bodies.length-1;j>i;j--){
      var a=bodies[i],e=bodies[j],ex=a.x-e.x,ey=a.y-e.y,rr=(a.size+e.size)*.8;
      if(ex*ex+ey*ey<rr*rr){
        var m=a.gm+e.gm;
        a.x=(a.x*a.gm+e.x*e.gm)/m;a.y=(a.y*a.gm+e.y*e.gm)/m;a.vx=(a.vx*a.gm+e.vx*e.gm)/m;a.vy=(a.vy*a.gm+e.vy*e.gm)/m;
        if(e.gm>a.gm)a.hue=e.hue;a.gm=m;a.size=Math.cbrt(m/40);a.comet=false;
        flashes.push({x:a.x,y:a.y,t:0,hue:a.hue});bodies.splice(j,1);
      }
    }
  }
  // Rough stepped glow: a few flat rings instead of a smooth gradient (cheaper, and it looks retro).
  function glow(x,y,r,color,alpha){
    ctx.fillStyle=color;
    for(var k=3;k>=1;k--){ctx.globalAlpha=alpha*(0.22+(3-k)*0.12);ctx.beginPath();ctx.arc(x,y,r*k/3,0,6.283);ctx.fill()}
    ctx.globalAlpha=1;
  }
  var NAMES={solar:'SOLAR SYSTEM',binary:'BINARY STAR',moon:'PLANET + MOON',chaos:'CHAOS'};
  function draw(){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle='#0b0920';ctx.fillRect(0,0,cv.width,cv.height);
    ctx.setTransform(scale,0,0,scale,0,0);
    ctx.fillStyle='#fff';bg.forEach(function(s){ctx.globalAlpha=Math.sin(s.p+time*s.s)>0?.85:.35;ctx.fillRect(Math.round(s.x),Math.round(s.y),s.r>.5?1:.5,s.r>.5?1:.5)});
    ctx.globalAlpha=1;ctx.lineCap='round';
    ctx.setTransform(scale*zoom,0,0,scale*zoom,scale*(W/2-camX*zoom),scale*(H/2-camY*zoom));   // camera: zoom around (camX,camY)
    if(trails)bodies.forEach(function(b){
      // trail as 3 chunks of one path each, fading out (3 strokes instead of ~120)
      var t=b.trail,n=t.length;if(n<2)return;ctx.strokeStyle=b.comet?'#bfe6ff':'hsl('+b.hue+' 90% 66%)';
      for(var c=0;c<3;c++){var a=Math.floor(n*c/3),z=Math.floor(n*(c+1)/3);if(z-a<1)continue;
        ctx.globalAlpha=(c+1)*.25;ctx.lineWidth=b.comet?1:Math.max(.5,b.size*.35*(c+1)/3);
        ctx.beginPath();ctx.moveTo(t[a][0],t[a][1]);for(var k=a+1;k<=Math.min(z,n-1);k++)ctx.lineTo(t[k][0],t[k][1]);ctx.stroke()}
    });
    ctx.globalAlpha=1;
    suns.forEach(function(s,i){
      var c=i===0?amber:sky,p=1+.07*Math.sin(time*2+i);
      glow(s.x,s.y,s.r*5*p,c,.35);glow(s.x,s.y,s.r*2.2,c,.9);
      ctx.fillStyle='#fffbef';ctx.beginPath();ctx.arc(s.x,s.y,s.r*.75,0,6.283);ctx.fill();
    });
    bodies.forEach(function(b){
      var c=b.comet?'#dff3ff':'hsl('+b.hue+' 85% 64%)';glow(b.x,b.y,b.size*2.4,c,.45);
      ctx.fillStyle='hsl('+b.hue+' 60% 32%)';ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,6.283);ctx.fill();          // shadow side
      ctx.fillStyle=c;ctx.beginPath();ctx.arc(b.x-b.size*.2,b.y-b.size*.2,b.size*.78,0,6.283);ctx.fill();       // lit side
      ctx.fillStyle='#fff';ctx.fillRect(b.x-b.size*.5,b.y-b.size*.5,Math.max(.5,b.size*.25),Math.max(.5,b.size*.25)); // pixel highlight
    });
    flashes.forEach(function(f){ctx.strokeStyle='hsl('+f.hue+' 90% 72%)';ctx.globalAlpha=1-f.t;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(f.x,f.y,4+f.t*26,0,6.283);ctx.stroke()});
    ctx.globalAlpha=1;
    if(aim){
      var ex=aim.x+(aim.x-aim.ex),ey=aim.y+(aim.y-aim.ey);
      ctx.setLineDash([3,3]);ctx.strokeStyle=sky;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(aim.x,aim.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=sky;ctx.beginPath();ctx.arc(aim.x,aim.y,3,0,6.283);ctx.fill();
    }
    ctx.setTransform(scale,0,0,scale,0,0);
    ctx.font='700 6px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillText('POCKET GRAVITY LAB',7,11);
    ctx.textAlign='right';ctx.fillStyle=amber;ctx.fillText(NAMES[preset]||'',W-7,11);
    ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillText((zoom>=ZMAX?'ZOOM MAX':zoom<=ZMIN?'ZOOM MIN':'ZOOM \u00d7'+zoom.toFixed(1))+'   G \u00d7'+G.toFixed(2)+'   SPEED \u00d7'+warp,W-7,H-7);
    ctx.textAlign='left';ctx.fillText(bodies.length+(bodies.length===1?' BODY':' BODIES')+(mutual?'  \u00b7  N-BODY':'')+'  \u00b7  T '+simT.toFixed(0)+'s',7,H-7);
  }
  function frame(t){
    raf=0;var dt=Math.min((t-lastT)/1000,0.05);lastT=t;time+=dt;
    var n=Math.ceil(4*warp),h=dt*warp/n;for(var k=0;k<n;k++)step(h);
    if(trails)bodies.forEach(function(b){b.trail.push([b.x,b.y]);var L=b.comet?90:60;if(b.trail.length>L)b.trail.shift()});
    for(var i=flashes.length-1;i>=0;i--){flashes[i].t+=dt*1.5;if(flashes[i].t>=1)flashes.splice(i,1)}
    draw();
    if(!paused&&onScreen&&!document.hidden)raf=requestAnimationFrame(frame);
  }
  function run(){if(!raf&&!paused&&onScreen&&!document.hidden){lastT=performance.now();raf=requestAnimationFrame(frame)}}
  function setPaused(p){paused=p;pauseBtn.textContent=p?'Play':'Pause';if(!p)run()}
  function scr(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
  function pt(e){var q=scr(e);return [(q[0]-W/2)/zoom+camX,(q[1]-H/2)/zoom+camY]}
  // Zoom so the world point under screen point (sx,sy) stays put.
  function setZoom(z,sx,sy){
    z=Math.max(ZMIN,Math.min(ZMAX,z));if(sx==null){sx=W/2;sy=H/2}
    var wx=(sx-W/2)/zoom+camX,wy=(sy-H/2)/zoom+camY;zoom=z;
    if(zoom===1){camX=cx;camY=cy}else{camX=wx-(sx-W/2)/zoom;camY=wy-(sy-H/2)/zoom}
    if($('orbit-zin'))$('orbit-zin').disabled=zoom>=ZMAX;if($('orbit-zout'))$('orbit-zout').disabled=zoom<=ZMIN;
    draw();
  }
  cv.addEventListener('wheel',function(e){e.preventDefault();var q=scr(e);setZoom(zoom*(e.deltaY<0?1.15:1/1.15),q[0],q[1])},{passive:false});
  if($('orbit-zin'))$('orbit-zin').addEventListener('click',function(){setZoom(zoom*1.4)});
  if($('orbit-zout'))$('orbit-zout').addEventListener('click',function(){setZoom(zoom/1.4)});

  // Tap: drop a planet into orbit. Drag: pull back like a slingshot and let go to fling it.
  cv.addEventListener('pointerdown',function(e){var p=pt(e);aim={x:p[0],y:p[1],ex:p[0],ey:p[1]};try{cv.setPointerCapture(e.pointerId)}catch(_){}draw()});
  cv.addEventListener('pointermove',function(e){if(!aim)return;var p=pt(e);aim.ex=p[0];aim.ey=p[1];if(paused)draw()});
  // A drag flings on release; a plain tap is handled by 'click', which every browser and input type fires reliably.
  var flung=false;
  cv.addEventListener('pointerup',function(){
    if(!aim)return;var dx=aim.x-aim.ex,dy=aim.y-aim.ey;
    flung=dx*dx+dy*dy>=25/(zoom*zoom);
    if(flung){add(aim.x,aim.y,dx*1.5*zoom,dy*1.5*zoom);accel();run()}
    aim=null;draw();
  });
  cv.addEventListener('click',function(e){
    if(flung){flung=false;return}
    var p=pt(e);launch(p[0],p[1]);accel();draw();run();
  });
  cv.addEventListener('pointercancel',function(){aim=null});
  cv.addEventListener('keydown',function(e){
    if(e.key==='+'||e.key==='='){setZoom(zoom*1.4);return}
    if(e.key==='-'||e.key==='_'){setZoom(zoom/1.4);return}
    if(e.key==='0'){setZoom(1);return}
    if(e.key==='Enter'||e.key===' '){e.preventDefault();var a=Math.random()*6.283,d=25+Math.random()*35;launch(cx+Math.cos(a)*d*1.5,cy+Math.sin(a)*d);accel();draw();run()}
  });
  pauseBtn.addEventListener('click',function(){setPaused(!paused)});
  $('orbit-reset').addEventListener('click',function(){load(preset);run()});
  if($('orbit-clear'))$('orbit-clear').addEventListener('click',function(){bodies=[];flashes=[];aim=null;draw()});
  if(gIn)gIn.addEventListener('input',function(){var g=parseFloat(gIn.value),f=Math.sqrt(g/G);G=g;bodies.forEach(function(b){b.vx*=f;b.vy*=f});if(binary)binary.w=Math.sqrt(40000*G/Math.pow(16,3));accel();draw()});  // orbits keep their shape and just speed up or slow down
  if(sIn)sIn.addEventListener('input',function(){warp=parseFloat(sIn.value);draw()});
  if(mIn)mIn.addEventListener('change',function(){mutual=mIn.checked;accel();draw()});
  if(tIn)tIn.addEventListener('change',function(){trails=tIn.checked;if(!trails)bodies.forEach(function(b){b.trail=[]});draw()});
  if(pIn)pIn.addEventListener('change',function(){load(pIn.value);run()});
  if(fsBtn){
    if(!box.requestFullscreen)fsBtn.hidden=true;
    fsBtn.addEventListener('click',function(){if(document.fullscreenElement)document.exitFullscreen();else box.requestFullscreen()});
    document.addEventListener('fullscreenchange',function(){fsBtn.textContent=document.fullscreenElement?'Exit full screen':'Full screen'});
  }
  document.addEventListener('visibilitychange',run);
  if('IntersectionObserver' in window)new IntersectionObserver(function(en){onScreen=en[0].isIntersecting;if(onScreen)run()},{threshold:0}).observe(cv);

  resize();load('solar');
  if(reduce)setPaused(true);else run();                           // respect "reduce motion": start paused on one frame
})();

// ---------- Easter egg: Konami code (or tap the name 5 times on a phone) ----------
(function(){
  var code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],pos=0;
  function party(){
    var on=document.documentElement.classList.toggle('party');
    if(window.senvorToast)window.senvorToast(on?'+30 XP':'Party mode off');
  }
  document.addEventListener('keydown',function(e){
    var k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k===code[pos]){pos++;if(pos===code.length){pos=0;party()}}else pos=(k===code[0])?1:0;
  });
  var h1=document.querySelector('.hero h1'),taps=0,t0=0;
  if(h1)h1.addEventListener('click',function(){
    var now=Date.now();taps=(now-t0<2000)?taps+1:1;t0=now;
    if(taps>=5){taps=0;party()}
  });
})();

// ---------- DevRuler converter ----------
// Same categories as the table printed on the ruler. Every unit is stored as a factor to one base unit
// (metres, square metres, litres, kilograms); temperature is handled with formulas.
(function(){
  var box=document.querySelector('.conv'),kind=document.getElementById('cv-kind'),val=document.getElementById('cv-val'),
      from=document.getElementById('cv-from'),to=document.getElementById('cv-to'),out=document.getElementById('cv-out'),swap=document.getElementById('cv-swap');
  if(!box||!kind||!val||!from||!to||!out||!swap)return;
  var SETS={
    length:{u:[['mm',.001],['cm',.01],['m',1],['km',1000],['in',.0254],['ft',.3048],['yd',.9144],['mi',1609.344]],d:['in','cm']},
    area:{u:[['cm\u00b2',1e-4],['m\u00b2',1],['km\u00b2',1e6],['in\u00b2',6.4516e-4],['ft\u00b2',.09290304],['yd\u00b2',.83612736],['acre',4046.8564224]],d:['ft\u00b2','m\u00b2']},
    volume:{u:[['mL',.001],['L',1],['fl oz',.0295735295625],['cup',.2365882365],['qt',.946352946],['gal',3.785411784]],d:['L','qt']},
    mass:{u:[['g',.001],['kg',1],['oz',.028349523125],['lb',.45359237]],d:['kg','lb']},
    temp:{u:[['\u00b0C'],['\u00b0F'],['K']],d:['\u00b0F','\u00b0C']}
  };
  function toC(v,u){return u==='\u00b0C'?v:u==='\u00b0F'?(v-32)*5/9:v-273.15}
  function fromC(c,u){return u==='\u00b0C'?c:u==='\u00b0F'?c*9/5+32:c+273.15}
  function factor(set,name){for(var i=0;i<set.u.length;i++)if(set.u[i][0]===name)return set.u[i][1]}
  function fmt(n){return n.toLocaleString('en',{maximumSignificantDigits:6})}
  function fill(sel,set,pick){
    sel.innerHTML='';
    set.u.forEach(function(x){var o=document.createElement('option');o.value=o.textContent=x[0];sel.appendChild(o)});
    sel.value=pick;
  }
  function load(){var set=SETS[kind.value];fill(from,set,set.d[0]);fill(to,set,set.d[1]);calc()}
  function calc(){
    var set=SETS[kind.value],raw=val.value.trim(),v=parseFloat(raw);
    if(raw===''||!isFinite(v)){out.textContent='Enter a number to convert.';return}
    var r,c;
    if(kind.value==='temp'){
      c=toC(v,from.value);
      if(c<-273.15){out.textContent='That is below absolute zero.';return}
      r=fromC(c,to.value);
    }else r=v*factor(set,from.value)/factor(set,to.value);
    out.textContent=fmt(v)+' '+from.value+' = '+fmt(r)+' '+to.value;
  }
  kind.addEventListener('change',load);
  [val,from,to].forEach(function(e){e.addEventListener('input',calc);e.addEventListener('change',calc)});
  swap.addEventListener('click',function(){var a=from.value;from.value=to.value;to.value=a;calc()});
  load();
  box.hidden=false;
})();
