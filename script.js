(function(){
  var tree=document.getElementById('tree'),trait=document.getElementById('trait');
  var TRAITS=['Quick learner','Night owl','Stubborn','Lucky','Curious','Steady hands','Restless','Cheerful'];
  var line=[],counter=0;
  function rnd(n){return Math.floor(Math.random()*n)}
  function first(){
    var bits=[];for(var i=0;i<32;i++)bits.push(Math.random()<.5);
    return {bits:bits,hue:rnd(360),trait:TRAITS[rnd(TRAITS.length)]};
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
      c.setAttribute('role','img');c.setAttribute('aria-label','Generation '+g.n+', trait: '+g.trait);
      draw(c,g);
      var s=document.createElement('small');s.textContent='Gen '+g.n;
      d.appendChild(c);d.appendChild(s);tree.appendChild(d);
    });
    var last=line[line.length-1];
    trait.textContent=last.mutated?'Gen '+last.n+' mutated: now '+last.trait.toLowerCase()+'.':'Gen '+last.n+' inherited: '+last.trait.toLowerCase()+'.';
  }
  function add(g){g.n=++counter;line.push(g);if(line.length>6)line.shift()}
  add(first());add(child(line[0]));add(child(line[1]));
  render('intro');
  document.getElementById('next').addEventListener('click',function(){add(child(line[line.length-1]));render('new')});

  // Icons taken from pixelarticons (https://github.com/halfmage/pixelarticons), MIT License, (c) 2019 Gerrit Halfmann.
  // Every icon is drawn on pixelarticons' 24x24 grid (one art pixel = 2 units), so they all share one viewBox and scale together.
  var RAW={
    code:'<g transform="translate(-1.2 -1.2) scale(1.1)"><path d="M5 4h4v2H5zm14 0h-4v2h4zM5 20h4v-2H5zm14 0h-4v-2h4zM3 6h2v12H3zm18 0h-2v12h2zm-10 5h2v2h-2zm-4 0h2v2H7zm8 0h2v2h-2z"/></g>',
    web:'<path d="M6 2h12v2H6zm0 18h12v2H6zM4 4h2v2H4zm5 0h2v2H9zm0 14h2v2H9zm4 0h2v2h-2zM7 6h2v12H7zm8 0h2v12h-2zm-2-2h2v2h-2zm7 0h-2v2h2zM2 6h2v12H2zm20 0h-2v12h2zM4 18h2v2H4zm16 0h-2v2h2z"/><path d="M3 11h18v2H3z"/>',
    css:'<path d="M2 2h20v2h-20zM2 4h2v2h-2zM20 4h2v2h-2zM2 6h2v2h-2zM8 6h8v2h-8zM20 6h2v2h-2zM2 8h2v2h-2zM14 8h2v2h-2zM20 8h2v2h-2zM2 10h2v2h-2zM10 10h6v2h-6zM20 10h2v2h-2zM2 12h2v2h-2zM14 12h2v2h-2zM20 12h2v2h-2zM4 14h2v2h-2zM8 14h8v2h-8zM18 14h2v2h-2zM4 16h2v2h-2zM18 16h2v2h-2zM6 18h2v2h-2zM16 18h2v2h-2zM8 20h8v2h-8z"/>',
    js:'<path d="M6 4h4v2H6zm12 0h-4v2h4zM6 20h4v-2H6zm12 0h-4v-2h4zM4 6h2v5H4zm16 0h-2v5h2zM4 18h2v-5H4zm16 0h-2v-5h2zM2 11h2v2H2zm20 0h-2v2h2z"/>',
    java:'<path d="M4 4h16v2H4zm0 2h2v8H4zm2 8h10v2H6zm14-8h2v4h-2zm-2 4h2v2h-2zm-2-4h2v8h-2zM2 18h18v2H2z"/>',
    godot:'<path d="M4 4h16v2H4zm0 14h16v2H4zM2 6h2v12H2zm18 0h2v12h-2zM8 9h2v6H8z"/><path d="M6 11h6v2H6zm8-2h2v2h-2zm2 4h2v2h-2z"/>',
    py:'<g transform="translate(2 2) scale(.8333)"><path d="M4 0h10v2h-10zM2 2h2v2h-2zM6 2h10v2h-10zM2 4h14v2h-14zM2 6h14v2h-14zM2 8h8v2h-8zM2 10h20v2h-20zM2 12h20v2h-20zM14 14h8v2h-8zM8 16h14v2h-14zM8 18h14v2h-14zM8 20h10v2h-10zM20 20h2v2h-2zM10 22h10v2h-10z"/></g>',
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
    root.classList.add('fade');
    var next=dark?'light':'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('theme',next)}catch(e){}
    setTimeout(function(){root.classList.remove('fade')},350);
  });
})();
