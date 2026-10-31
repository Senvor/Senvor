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

  var BM={
    chip:['..#..#..','.######.','##....##','.#....#.','##....##','.#....#.','.######.','..#..#..'],
    window:['########','#......#','########','#......#','#.####.#','#......#','#.####.#','########'],
    invader:['..#..#..','...##...','..####..','.##..##.','########','#.####.#','#.#..#.#','...##...'],
    code:['........','..#..#..','.#....#.','#......#','.#....#.','..#..#..','........','........'],
    ghost:['..####..','.#....#.','#.#..#.#','#.#..#.#','#......#','#......#','#.##.#.#','.#.##.#.'],
  };
  // Icons taken from pixelarticons (https://github.com/halfmage/pixelarticons), MIT License, (c) 2019 Gerrit Halfmann.
  // They are drawn on a 24x24 grid, so they are stored as ready-made SVG paths instead of 8x8 bitmaps.
  var RAW={
    brush:{vb:'2 2 20 20',d:'<path d="M5 2h12v2H5zm0 2h2v10H5zm12-2h2v12h-2z"/><path d="M13 2h2v6h-2zM9 2h2v4H9zm-4 8h14v2H5zm0 4h14v2H5zm4 2h2v4H9zm4 0h2v4h-2zm-4 4h6v2H9z"/>'},
    shapes:{vb:'2 2 20 20',w:20,d:'<path d="M2 13h9v2H2zm0 2h2v5H2zm0 5h9v2H2zm7-5h2v5H9zm6-2h5v2h-5zm-2 2h2v5h-2zm2 5h5v2h-5zm5-5h2v5h-2zM7 9h10v2H7zm0-2h2v2H7zm2-3h2v3H9zm2-2h2v2h-2zm2 2h2v3h-2zm2 3h2v2h-2z"/>'},
    cut:{vb:'1 2 22 22',w:22,d:'<path d="M1 17h2v4H1zm14 0h2v4h-2zM3 21h4v2H3zm14 0h4v2h-4zM3 15h4v2H3zm14 0h4v2h-4zM7 17h2v4H7zm14 0h2v4h-2zM7 15h2v2H7zm8 0h2v2h-2zm-6-2h2v2H9zm6 0h-2v2h2zm-4-2h2v2h-2z"/><path d="M13 11h-2v2h2zm0-2h2v2h-2zm-2 0H9v2h2zm4-2h2v2h-2zM9 7H7v2h2zm8-2h2v2h-2zM7 5H5v2h2zm12-2h2v2h-2zM5 3H3v2h2z"/>'}
  };
  function ic(n){if(RAW[n])return'<svg class="ic"'+(RAW[n].w?' style="width:'+RAW[n].w+'px"':'')+' viewBox="'+RAW[n].vb+'" aria-hidden="true" shape-rendering="crispEdges" fill="currentColor">'+RAW[n].d+'</svg>';var r=BM[n],a=8,b=-1,x,y;for(y=0;y<8;y++)if(r[y].indexOf('#')>-1){if(y<a)a=y;b=y}var s='<svg class="ic" viewBox="0 '+a+' 8 '+(b-a+1)+'" aria-hidden="true" shape-rendering="crispEdges" fill="currentColor">';for(y=a;y<=b;y++)for(x=0;x<8;x++)if(r[y].charAt(x)==='#')s+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';return s+'</svg>'}
  function tag(sel,map){document.querySelectorAll(sel).forEach(function(el){var k=el.textContent.trim();if(map[k])el.insertAdjacentHTML('afterbegin',ic(map[k]))})}
  tag('.group',{Hardware:'chip',Web:'window',Games:'invader'});
  tag('.sg',{Code:'code',Hardware:'chip',Design:'brush'});
  tag('.chips li',{HTML:'code',CSS:'code',JavaScript:'code',Java:'code',GDScript:'code','p5.js':'code',Python:'code','C++':'code',Aseprite:'ghost',Canva:'shapes',CapCut:'cut',KiCad:'chip',Arduino:'chip',EasyEDA:'chip'});

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
