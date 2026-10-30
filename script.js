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
    window:['########','#.#....#','########','#......#','#.####.#','#......#','#.##...#','########'],
    pad:['........','.######.','#.#..#.#','###..###','#.#..#.#','#......#','.##..##.','........'],
    code:['........','..#..#..','.#....#.','#......#','.#....#.','..#..#..','........','........'],
    brush:['......##','.....###','....###.','...###..','..###...','.###....','##......','#.......'],
    star:['...##...','...##...','########','.######.','..####..','.##..##.','.#....#.','........'],
    fork:['.#....#.','.#....#.','.#....#.','.##..##.','..####..','...##...','...##...','...##...'],
    chat:['........','########','#......#','#......#','#......#','########','..##....','..#.....'],
    alien:['..#..#..','...##...','.######.','#.#..#.#','########','.######.','..#..#..','........'],
    x:['#......#','.#....#.','..#..#..','...##...','...##...','..#..#..','.#....#.','#......#'],
    camera:['........','..###...','########','#......#','#.####.#','#.#..#.#','#.####.#','########'],
    play:['##......','####....','######..','########','########','######..','####....','##......']
  };
  function ic(n){var r=BM[n],a=8,b=-1,x,y;for(y=0;y<8;y++)if(r[y].indexOf('#')>-1){if(y<a)a=y;b=y}var s='<svg class="ic" viewBox="0 '+a+' 8 '+(b-a+1)+'" aria-hidden="true" shape-rendering="crispEdges" fill="currentColor">';for(y=a;y<=b;y++)for(x=0;x<8;x++)if(r[y].charAt(x)==='#')s+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';return s+'</svg>'}
  function tag(sel,map){document.querySelectorAll(sel).forEach(function(el){var k=el.textContent.trim();if(map[k])el.insertAdjacentHTML('afterbegin',ic(map[k]))})}
  tag('.group',{Hardware:'chip',Web:'window',Games:'pad'});
  tag('.sg',{Code:'code',Hardware:'chip',Design:'brush'});
  tag('.chips li',{HTML:'code',CSS:'code',JavaScript:'code',Java:'code',GDScript:'code','p5.js':'code',Python:'code',Aseprite:'star',Canva:'brush',CapCut:'play',KiCad:'chip',Arduino:'chip',EasyEDA:'chip'});

  var root=document.documentElement,btn=document.getElementById('theme');
  btn.addEventListener('click',function(){
    var dark=getComputedStyle(root).getPropertyValue('--bg').trim()==='#15132b';
    root.classList.add('fade');
    root.setAttribute('data-theme',dark?'light':'dark');
    setTimeout(function(){root.classList.remove('fade')},350);
  });
})();
