gameScr = true;

var closeX=null;

var icons = [
 "img/game/bunny.webp",
 "img/game/rabbit.webp",
 "img/icon64.png",
];

var drag = {
    on: false,
    sy:0,
    sx:0
};

var uos = 'ColorPick unofficial sponsor:';
var uof = 'ColorPick sponsor:';

var sponsors = [];
var sponsorsPaid = [];
var sponsorsPaidCount = 0;

var sponsorsDefault = [
    {
        img:chrome.extension.getURL('img/sponsors/colordoctor.jpg'),
        title:'Color Doctor\nhypertension tester',
        href:'https://amzn.to/2KWw7hJ'
    },
    {
        img:chrome.extension.getURL('img/sponsors/waterpik.jpg'),
        title:'Waterpik\njust add water',
        href:'https://amzn.to/2KXVEqM'
    },{
        img:chrome.extension.getURL('img/sponsors/picks.jpg'),
        title:'Pick\nVarious to choose from',
        href:'https://amzn.to/31PJJC7'
    },{
        img:chrome.extension.getURL('img/sponsors/laser.jpg'),
        title:'Color Laser Printer\nAre you tired of refilling ink?',
        href:'https://amzn.to/2KL8d9V'
    },{
        img:chrome.extension.getURL('img/sponsors/color.jpg'),
        title:'Color\nmost expensive',
        href:'https://amzn.to/2ZeTTug',
        maxw:'125px'
    },{
        img:chrome.extension.getURL('img/sponsors/prismacolor.jpg'),
        title:'Prismacolor\nProfessional Markers etc',
        href:'https://amzn.to/31K2kj0'
    },{
        img:chrome.extension.getURL('img/sponsors/bulb.jpg'),
        title:'Color Changing LED Bulbs\nWay too cool',
        href:'https://amzn.to/31S7pFS'
    },{
        img:chrome.extension.getURL('img/sponsors/purple.jpg'),
        title:'The color Purple\ngo get yourself a mattress',
        href:'https://amzn.to/2uhRjtF'
    }
];

// todo, each time we re-enter, we should re-roll the default sponsors... and reset to paid sponsors
function randomizeDefaultSponsors(){
    sponsorsDefault = sponsorsDefault.sort(function(){return Math.random() > 0.5 ? 1 : -1;});
    sponsors = sponsorsPaid.concat(sponsorsDefault);
    last_sponsor_index = -1;
}

// TODO:
// Sponsor should NOT be random.... really it should cycle in "random" order

var last_sponsor_index = -1;

function rollPaidSponsor(){
    return Math.floor(Math.random()*sponsorsPaidCount);
}

function rollSponsor(){
    return Math.floor(Math.random()*sponsors.length);
}

function rollSponsorAgain(){
//    var sponsor = rollSponsor();
//    while( sponsor == last_sponsor_index ){
//        sponsor = rollSponsor();
//    }
//    last_sponsor_index = sponsor;
//    return sponsor;
    
    // for NON random ordering...
    last_sponsor_index++;
    // if our index is greater than our paid sponsor... chance to reset to a paid sponsor should increase
    if( last_sponsor_index >= sponsorsPaidCount ){
        if( Math.random() < last_sponsor_index / sponsors.length ){
            last_sponsor_index = rollPaidSponsor();
        }
    }
    if( last_sponsor_index >= sponsors.length ){
        last_sponsor_index = 0;
    }
    return last_sponsor_index;
}

function nextIconImage(g_moveCtr){
    //g_moveCtr = wmMoveCtr-4
    // when this is called we already tested if(!waterm) return;

    if( icons[g_moveCtr%icons.length] ){
        waterml.src = chrome.extension.getURL(icons[g_moveCtr%icons.length]);
    }

    console.log('next from index', g_moveCtr, '%'+wmTipsTotal+':', g_moveCtr % wmTipsTotal, watermct)

    //return;

    waterm.firstChild.style.display="block";


    if( g_moveCtr == 4 ){
        // for this time of triggering the extension, this is the first call to this function
        randomizeDefaultSponsors();
    }
    
    // the principle is that we let the ads in 1 slot early
    // targeting tips_5": {"message": "Your Ad Here
    // to replace this with an ad, but then we allow tip 0 to display (g_moveCtr==6, tip 0)
    // then all subsequent slots are ads
    if( g_moveCtr % wmTipsTotal == 5 || g_moveCtr > wmTipsTotal ){

        
        // waterml.src = chrome.extension.getURL('img/icon64.png');
        // Cr.empty(watermct);
        // Cr.elm('div',{id:'tip_'+((g_moveCtr + 4)%6),childNodes:[
        //     Cr.txt('TEST!'),
        // ]}, watermct);

        
        
        closeX=Cr.elm('div', {
            style:'top:0;right:3px;position:absolute;',
            childNodes:[
            
                Cr.elm('a',{
                    style:'cursor:pointer;text-decoration:none;margin-bottom:3px;',
                    title:chrome.i18n.getMessage('tips_0'),
                    events:[
                        ['click', function(ev){
                            if(!confirm(chrome.i18n.getMessage('tips_0'))){
                                return;
                            }
                            navToReg(ev);
                        }],
                        ['mouseover',function(ev){ev.target.style.textDecoration='underline';}],
                        ['mouseout',function(ev){ev.target.style.textDecoration='none';}]
                    ],
                    childNodes:[Cr.txt('?')]
                }),
                Cr.txt(' '),
                Cr.elm('a',{
                    style:'cursor:pointer;text-decoration:none;margin-bottom:3px;',
                    title:chrome.i18n.getMessage('hideMinimize') + ' ' + uos,
                    events:[
                        ['click', function(ev){
                            waterm.name='';moveWm(ev);closeX.remove();
                        }],
                        ['mousedown', function(ev){ // redundant but makes it easy for fingers to touch dismiss rather than the ad using drag gesture
                            waterm.name='';moveWm(ev);closeX.remove();
                        }],
                        ['mouseover',function(ev){ev.target.style.textDecoration='underline';}],
                        ['mouseout',function(ev){ev.target.style.textDecoration='none';}]
                    ],
                    childNodes:[Cr.txt('-_-')]
                })
        ]}, waterm);
        
        
        


        var sponsor = sponsors[rollSponsorAgain()];

        //console.log('in adspace', sponsor);

        var thisUos = !sponsor.id ? uos : uof;
        
        Cr.empty(watermct);
        Cr.elm('div',{id:'sponsor_tip_'+(g_moveCtr % wmTipsTotal),childNodes:[
            Cr.elm('div',{
                title: thisUos,
                style:'font-size:8px',
                childNodes: [Cr.txt(thisUos)]}),
            Cr.elm('a',{
                href: sponsor.href,
                target: '_blank',
                style:'white-space:pre;text-align:center;display:block;text-decoration:none;font-size:10pt;',
                childNodes:[
                    Cr.elm('img',{
                        style: 'padding-bottom:5px;max-width: '+(sponsor.maxw || '100%')+' !important;max-height:47vh !important;display:block;',
                        alt: (sponsor.alt || "Sponsor Image"),
                        src: sponsor.img
                    }),
                    (sponsor.title ? Cr.txt(sponsor.title) : 0)
                ]
            }),
            // sponsor.id indicates paid sponsor, so skip the amazon search area
            (!sponsor.id ? Cr.elm('div',{
                title: thisUos,
                style:'font-size:8px',
                childNodes: [
                    Cr.elm('form', {action: 'https://www.amazon.com/s', method: 'GET', childNodes:[
                        Cr.elm('input', {type: 'hidden', name: 'tag', value: "colorpick01-20"}),
                        Cr.elm('input', {type: 'search', name: 'k'}),
                        Cr.elm('input', {type: 'submit', prompt: 'search', value: '\uD83D\uDD0D  Amazon', style:'position: absolute;right: 5px;font-size:8pt;'})
                    ]})
            ]}) : 0 ),
        ]}, watermct);



        waterm.firstChild.style.display="none";

        // waterm.firstChild.setAttribute('draggable', true);
        // waterm.firstChild.addEventListener('dragstart', function(ev){
        //     drag.on=true;
        //     drag.sy = ev.offsetY
        // });
        // waterm.firstChild.addEventListener('drag', function(ev){
        //     console.log('ok',(ev.offsetY - drag.sy));

        //     if( drag.on ){
        //         waterm.style.top = ((waterm.style.top-0||0) + (ev.offsetY - drag.sy)) + 'px';
        //     }

        // });
        // waterm.firstChild.addEventListener('dragend', function(){
        //     drag.on=false;
        // });

        waterm.name='data-stay-put';
    }
}

function paidSponsorsRcvd(json){
    //console.log('content script got json... ', json);
    var arrRecieved = JSON.parse(json);
    if( arrRecieved.length ){
        sponsorsPaid = arrRecieved;
        sponsorsPaidCount = sponsorsPaid.length;
        randomizeDefaultSponsors() // this will probably be called anyway soon, but we'll make sure it is called once
    }
}

function initGame(){
    chrome.runtime.sendMessage({requestSponsorsList:true, devicePixelRatio: devicePixelRatio, timestamp: (new Date()).getTime()}, function(response){});
}
initGame();

