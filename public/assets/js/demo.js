"use strict";


//Notify
// $.notify({
// 	icon: 'icon-bell',
// 	title: 'Kaiadmin',
// 	message: 'Premium Bootstrap 5 Admin Dashboard',
// },{
// 	type: 'secondary',
// 	placement: {
// 		from: "bottom",
// 		align: "right"
// 	},
// 	time: 1000,
// });

let dataToSend = [], table;

document.querySelector('input').addEventListener('change', function() {
	var reader = new FileReader();
	reader.onload = function() {
		var arrayBuffer = this.result,
			array = new Uint8Array(arrayBuffer),
			binaryString = String.fromCharCode.apply(null, array);

		/* Call XLSX */
		var workbook = XLSX.read(binaryString, {
			type: "binary"
		});

		/* DO SOMETHING WITH workbook HERE */
		var first_sheet_name = workbook.SheetNames[0];
		/* Get worksheet */
		var worksheet = workbook.Sheets[first_sheet_name];
		let res = formatExcelData(XLSX.utils.sheet_to_json(worksheet, {
			raw: true
		}));

		if (res.length === 0) {
			$.notify({
				icon: 'icon-bell',
				title: 'Warning',
				message: 'Please check the spreadsheet',
			},{
				type: 'secondary',
				placement: {
					from: "bottom",
					align: "right"
				},
				time: 1000,
			});
		}
		else {
			dataToSend = res;
			renderTable(res);
			console.log(res)
		}
		$('#import-input').val('');
	}
	reader.readAsArrayBuffer(this.files[0]);
});

function formatExcelData(rawData) {
  console.log(rawData);
  let formatData = [];
  let header = rawData[0];
  let nameIndex = '', phoneNoIndex = '', msgIndex = '';

  for (const key in header) {
	if (Object.hasOwnProperty.call(header, key)) {
	  if(header[key] === 'PHONE_NO') {
		phoneNoIndex = key;
	  }
	  if(header[key] === 'NAME') {
		nameIndex = key;
	  }
	  if(header[key] === 'MESSAGE') {
		msgIndex = key;
	  }
	}
  }

  if (nameIndex === '' || phoneNoIndex === '' || msgIndex === '') {
	return [];
  }

  rawData.forEach( (rawItem, i) => {
	if (i > 0) {
	  formatData.push({
		name: rawItem[nameIndex],
		phoneNo: rawItem[phoneNoIndex],
		msgText: rawItem[msgIndex],
		status: ''
	  })
	}
  });

  return formatData;
}

function formatTableJSON(data) {
	let r = [];
	data.forEach(d => {
		r.push([d.name, d.phoneNo, d.msgText, d.status])
	})

	return r;
}

function renderTable(data) {
  let dataSet = formatTableJSON(data);

  table = $("#multi-filter-select").DataTable({
	destroy: true,
	pageLength: 10,
	columns: [
		{ title: 'Name' },
		{ title: 'Phone No' },
		{ title: 'Message' },
		{ title: 'Status'}
	],
	data: dataSet
  })
}

function onImportBtnClick () {
	$("#import-input").click();
}

$("#import-btn").click(onImportBtnClick);

$("#clear-btn").click(() => {
	if (table) {
		table.destroy();
		table = undefined;
	}
	$("#multi-filter-select").empty();
	dataToSend = [];
});

$("#send-btn").click(async () => {
	console.log('send btn clicked', dataToSend);

	if (dataToSend.length === 0) {
		$.notify({
			icon: 'icon-bell',
			title: 'Warning',
			message: 'No messages to send',
		},{
			type: 'secondary',
			placement: {
				from: "bottom",
				align: "right"
			},
			time: 1000,
		});

		return;
	}

	showLoading();
	for (const dItem of dataToSend) {
		let r = await callPostAPI(dItem);
		console.log()
		dItem.status = r.status;
	}
	hideLoader();

	let dataSet = formatTableJSON(dataToSend);
	table.clear();
    table.rows.add(dataSet);
    table.draw();
});


async function callPostAPI(data) {
	let postData = {
        phoneNo: data.phoneNo,
        msgText: data.msgText,
        usrName: data.name
    }
	console.log('postData', postData);
	const rawResponse = await fetch('/send-message', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });
  const content = await rawResponse.json();

  console.log(content);
  return content;
}

function showLoading() {
	$('body').waitMe({
		effect : 'bounce',
		text : 'Sending',
		bg : 'rgba(255,255,255,0.7)',
		color : '#000'
	});
}

function hideLoader() {
	$('body').waitMe('hide');
}
