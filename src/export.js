var $ = require('jquery');

function encodeHtml(str) {
	return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

function encodeCsvCellValue(value) {
	if((/,|"/).test(value)) {
		value = '"' + value.replace(/"/g, '""') + '"';
	}
	return value;
}

function getCellValue(data, column, i, j) {
	var ids = column.id.split('.');
	var value = data[ids.shift()];
	while(ids.length && value && typeof value == 'object') {
		value = value[ids.shift()];
	}
	if(value != null && value.toString) {
		value = value.toString();
	}
	var renderer = column.exportRenderer || column.renderer;
	if(renderer) {
		value = renderer(encodeHtml(value || ''), i, data, j, column, false);
		if(value == null) {
			value = '';
		}
	}
	return value;
}

function exportCsv(data, columns, fileName) {
	fileName = (fileName || new Date().getTime()) + '.csv';
	var blobData = [];
	var i;
	for(i = -1; i < data.length; i++) {
		var rowData = [];
		columns.forEach(function(column, j) {
			if(i === -1) {
				rowData.push(encodeCsvCellValue(column.name));
			} else {
				rowData.push(encodeCsvCellValue(getCellValue(data[i], column, i, j)));
			}
		});
		blobData.push(rowData.join(','));
	}
	var blob = new Blob(['\ufeff' + blobData.join('\n')], {type: 'text/csv'});
	if(window.navigator.msSaveOrOpenBlob) {
		navigator.msSaveBlob(blob, fileName);
	} else {
		var link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = fileName;
		link.click();
		window.URL.revokeObjectURL(link.href);
	}
}

function exportXlsx(data, columns, fileName) {
	fileName = (fileName || new Date().getTime()) + '.xlsx';
	window.require(['xlsx'], function (XLSX) {
		var blobData = [];
		var i;
		for(i = -1; i < data.length; i++) {
			var rowData = [];
			columns.forEach(function(column, j) {
				if(i === -1) {
					rowData.push(column.name);
				} else {
					rowData.push(getCellValue(data[i], column, i, j));
				}
			});
			blobData.push(rowData);
		}
		var wb = XLSX.utils.book_new();
		var ws = XLSX.utils.aoa_to_sheet(blobData);
		XLSX.utils.book_append_sheet(wb, ws, fileName);
		XLSX.writeFile(wb, fileName);
	});
}

module.exports = {
	exportCsv: exportCsv,
	exportXlsx: exportXlsx
};
