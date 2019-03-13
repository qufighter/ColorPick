function phoneBtnClick(){
	var sh = gel('phone-itself');
	sh.style.transition = '1s ease-out';
	sh.style.transform = 'rotateZ('+Math.round((Math.random()*50)-25)+'deg) scale3d(0.8,0.8,1)';
	setTimeout(function(){
		sh.style.transform = 'scale3d(1.0,1.0,1)';

	}, 1000);
}

function createPhoneDiv(){
	var nbsp='\u00A0';

	return Cr.elm('div',{
		id: 'phone-itself',
		style:'border:5px solid black;border-radius:20px;max-width:510px;background-color:black;box-shadow:black 0px 0px 3px;padding: 0px 62px 0px 22px;position:relative;', 
		childNodes:[
			Cr.elm('div',{style:'position:absolute;top:50%;height:0;width:30px;right:15px;', childNodes:[
				Cr.elm('div',{
					style:'position:relative;border:2px solid white;border-radius:20px;height:29px;width:29px;top:-16px;cursor:pointer;',
					event: ['click', phoneBtnClick]
				})
			]}),
			Cr.elm('div',{
				id: 'screen-holder',
				style:'background-color:#EEE;background:-webkit-linear-gradient(top, #FFF 0%,#EEE 50%,#EEE 100%);box-shadow:white 0px 0px 5px;min-height: 220px;padding:5px;border-radius:2px;', 
				childNodes:[
					Cr.txt('Independently licensed app now available for IOS and Android.'),
					Cr.elm('br'),
					Cr.elm('a', {style:'float:left;margin-right:10px;',target:"_blank",href:'http://vidsbee.com/ColorPick/Mobile'},[
						Cr.elm('img',{src:'img/simulator.png',height:240})
					]),
					Cr.txt('  Details available at '),
					Cr.elm('a', {target:"_blank",href:'http://vidsbee.com/ColorPick/Mobile'},[
						Cr.txt("vidsbee.com/ColorPick/Mobile")
					]),
					Cr.txt('.'),
					Cr.elm('br'),
					Cr.elm('br'),

					Cr.elm('a', {href:"https://itunes.apple.com/us/app/colorpick-eyedropper/id1455143862?mt=8", style:"display:inline-block;overflow:hidden;background:url(img/AppStore.svg) no-repeat;width:135px;height:40px;"}),
					Cr.txt(nbsp + nbsp ),
					Cr.elm('a', {href:"https://play.google.com/store/apps/details?id=com.vidsbee.colorpicksdl&utm_source=chrome-ext&utm_campaign=web&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1", style:"display:inline-block;overflow:hidden;background:url(img/PlayStore.png) no-repeat;width:135px;height:40px;background-position: -10px -10px; background-size: 113%;"}),

					Cr.elm('br'),
					Cr.txt('Features:'),
					Cr.elm('br'),
					Cr.txt('View and save colors from any image on your device.'),
					Cr.elm('br'),
					Cr.txt('Challenge yourself to Mini-games and master hexadecimal!'),
					Cr.elm('br'),
					Cr.txt('Built from the ground up with SDL OpenGL 3d graphics.'),
					Cr.elm('br'),
					Cr.txt('More features and challenges will be added soon.'),
					Cr.elm('br'),
					Cr.txt('Support continued development, Buy the app today!')
				]
			})
		]
	});
}
