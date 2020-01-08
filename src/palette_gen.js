// This file is not for all of the palette code,
// contains helpers to generate the meta-data associated with all the possible options
// we may consider moving some helpers here

var paletteGenData = (function(){
	var paletteStep = 360 / 12;
	var paletteGenerationModes = {
		complement: {
			name: chrome.i18n.getMessage('palette_complement'),
			info: chrome.i18n.getMessage('palette_complement_info'),
			order: 0,
			results: [
				{ angle: 6 * paletteStep }
			]
		},
		analogous: {
			name: chrome.i18n.getMessage('palette_analogous'),
			info: chrome.i18n.getMessage('palette_analogous_info'),
			order: 1,
			results: [
				{ angle: paletteStep },
				{ angle: -paletteStep },
			]
		},
		harmonious: {
			name: chrome.i18n.getMessage('palette_harmonious'),
			info: chrome.i18n.getMessage('palette_harmonious_info'),
			order: 2,
			results: [
				{ angle: 2 * paletteStep },
				{ angle: -2 *paletteStep },
			]
		},
		contrasting: {
			name: chrome.i18n.getMessage('palette_contrasting'),
			info: chrome.i18n.getMessage('palette_contrasting_info'),
			order: 3,
			results: [
				{ angle: 3 * paletteStep },
				{ angle: -3 *paletteStep },
			]
		},
		triadic: {
			name: chrome.i18n.getMessage('palette_triadic'),
			info: chrome.i18n.getMessage('palette_triadic_info'),
			order: 4,
			results: [
				{ angle: 4 * paletteStep },
				{ angle: -4 *paletteStep },
			]
		},
		splilt_complementary: {
			name: chrome.i18n.getMessage('palette_splilt_complementary'),
			info: chrome.i18n.getMessage('palette_splilt_complementary_info'),
			order: 5,
			results: [
				{ angle: 5 * paletteStep },
				{ angle: -5 *paletteStep },
			]
		},
		square: {
			name: chrome.i18n.getMessage('palette_square'),
			info: chrome.i18n.getMessage('palette_square_info'),
			order: 6,
			results: [
				{ angle: 3 * paletteStep },
				{ angle: -3 *paletteStep },
				{ angle: 6 * paletteStep },
			]
		},
		tetradic_l: {
			name: chrome.i18n.getMessage('palette_tetradic_left'),
			info: chrome.i18n.getMessage('palette_tetradic_info'),
			order: 7,
			results: [
				{ angle: 2 * paletteStep },
				{ angle: 6 * paletteStep },
				{ angle: 8 * paletteStep },
			]
		},
		tetradic_r: {
			name: chrome.i18n.getMessage('palette_tetradic_right'),
			info: chrome.i18n.getMessage('palette_tetradic_info'),
			order: 8,
			results: [
				{ angle: -2 * paletteStep },
				{ angle: -6 * paletteStep },
				{ angle: -8 * paletteStep },
			]
		}
	};

	// by denominator in 1/x
	var iFractionNames = {
		2: 'half',
		3: 'third',
		4: 'quarter',
		5: 'fifth'
	}
	var fractionNames = {
		2: chrome.i18n.getMessage('half'),
		3: chrome.i18n.getMessage('third'),
		4: chrome.i18n.getMessage('quarter'),
		5: chrome.i18n.getMessage('fifth')
	}

	var toneModes = {
		tone:{
			tone_fade:{iname:'tone_fade', name: chrome.i18n.getMessage('palette_minus_saturation'), key: 'sat', dir: -1},
			tone_boost:{iname:'tone_boost', name: chrome.i18n.getMessage('palette_plus_saturation'), key: 'sat', dir: 1}
		},
		bright:{
			bright_fade:{iname:'bright_fade', name: chrome.i18n.getMessage('palette_plus_darkness'), key: 'val', dir: -1},
			bright_boost:{iname:'bright_boost', name: chrome.i18n.getMessage('palette_minus_darkness'), key: 'val', dir: 1}
		}
	};

	var toneOrdering = 1;
	var paletteGenerationTones = {
		none: {
			name: chrome.i18n.getMessage('default'),
			info: '',
			order: 0,
			results: [
				{sat: 1.0}
			]
		}
	};

	function addCorrespondingTones(opsArr, orderingOffset){
		// console.log(opsArr);
		var iter = 2; // start at halves
		var max = 6; // up to fifths...
		var o, ops;
		while( iter < max ){
			var resultKeyParts = [];
			var resultNameParts = [fractionNames[iter]];
			var results = [];
			var inc = 1.0 / iter;
			var progs = []; // up to optsArr length...
			for( o=0; o<opsArr.length; o++ ){
				ops = opsArr[o];
				resultKeyParts.push(iFractionNames[iter] + '_' +ops.iname);
				resultNameParts.push(ops.name);
				progs.push(1.0); // we start at 1.0 and either - or + by inc
			}
			while( progs[0] > 0.1 && progs[0] < 1.9 ){
				// all progs[] various directions should expire simultaneously :)
				var result = {};
				for( o=0; o<opsArr.length; o++ ){
					ops = opsArr[o];
					result[ops.key] = progs[o];
					progs[o] += ops.dir * inc;
				}
				results.push(result);
			}
			iter++;
			// console.log(resultKeyParts, resultNameParts, results);
			var key = resultKeyParts.join('_');
			paletteGenerationTones[key] = {
				name: resultNameParts.join(' '),
				key: key,
				order: orderingOffset + toneOrdering++,
				results: results
			};
		}

	}

	var completedTypes = {};
	for( var type in toneModes ){
		for( var itype in toneModes[type] ){
			//console.log( itype)
			addCorrespondingTones([toneModes[type][itype]], 0);

			for( var rtype in toneModes ){
				if( rtype == type || completedTypes[rtype] ) continue;
				for( var ritype in toneModes[rtype] ){
					//console.log( itype, ritype)
					addCorrespondingTones([toneModes[type][itype], toneModes[rtype][ritype]], 250);
				}
			}
		}
		completedTypes[type] = true;
	}

	//console.log(paletteGenerationTones); // anticipate paletteGenerationTones

	return {
		Modes: paletteGenerationModes,
		Tones: paletteGenerationTones,
		paletteStep: paletteStep
	};

})();

// future use?
// var paletteGenHelpers = {}
