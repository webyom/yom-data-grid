var YomDataGrid = (function() {
var $ = window.jQuery || window.$;
var mainTpl = YomDataGridTpl;

var YomDataGrid = function(holder, columns, opt) {
	var self = this;
	opt = opt || {};
	this._opt = opt;
	this._name = opt.name || 'x';
	this._width = opt.width;
	this._height = opt.height;
	this._holder = $(holder);
	this._container = $('<div></div>').appendTo(holder);
	this._allColumns = [];
	this._defaultLockedColumns = [];
	this._lockedColumns = [];
	this._scrollColumns = [];
	this._data = [];
	this._lockedBody = null;
	this._scrollHeader = null;
	this._scrollBody = null;
	this._toRefResize = null;
	this._sortColumnId = opt.sortColumnId || '';
	this._sortOrder = opt.sortOrder || '';
	this._bind = {
		scroll: function(evt) {return self._onScroll(evt);},
		resize: function(evt) {return self._onResize(evt);}
	};
	this.setColumns(columns);
	this._bindEvent();
};

$.extend(YomDataGrid.prototype, {
	_MAX_LOCKED_COLUMNS: 3,
	_MIN_COLUMN_WIDTH: 34,
	_MAX_COLUMN_WIDTH: 999,
	_MAX_LOCKED_COLUMN_WIDTH: 300,
	_DEFAULT_COLUMN_WIDTH: 200,
	_MIN_HEIGHT: 100,

	_onScroll: function(evt) {
		var target = evt.target;
		if(this._lockedBody) {
			this._lockedBody.scrollTop = target.scrollTop;
		}
		if(this._scrollHeader) {
			this._scrollHeader.scrollLeft = target.scrollLeft;
		}
	},

	_onResize: function(evt) {
		var self = this;
		clearTimeout(this._toRefResize);
		this._toRefResize = setTimeout(function() {
			self.resize();
		}, 200);
	},

	_clientSort: function(columnId, sortOrder) {
		var dataProperty = this._opt.dataProperty;
		this._data.sort(function(a, b) {
			if(dataProperty) {
				a = a[dataProperty];
				b = b[dataProperty];
			}
			if(sortOrder == 'asc') {
				return a[columnId] > b[columnId] ? 1 : -1;
			} else {
				return b[columnId] > a[columnId] ? 1 : -1;
			}
		});
		this._sortOrder = sortOrder;
		this._sortColumnId = columnId;
		this.render();
	},

	_bindEvent: function() {
		var self = this;
		this._container.delegate('a.data-grid-sortable', 'click', function(evt) {
			var columnId = $(this).data('column-id');
			var sortOrder = $('.data-grid-sort-arrow-down', this).length ? 'asc' : 'desc';
			if(self._opt.onSort) {
				self._opt.onSort(columnId, sortOrder, function(data) {
					if(data) {
						self._sortOrder = sortOrder;
						self._sortColumnId = columnId;
						self.render(data);
					}
				});
			} else {
				self._clientSort(columnId, sortOrder);
			}
		}).delegate('.data-grid-check-box, .data-grid-check-box-all', 'click', function(evt) {
			var rowIndex = $(this).data('row-index');
			var allChecked = true;
			if(!(rowIndex >= 0)) {//all
				if(this.checked) {
					$('.data-grid-check-box', self._container).each(function(i, item) {
						item.checked = true;
						$(item).closest('.mockup-checkbox').addClass('on');
					});
				} else {
					$('.data-grid-check-box', self._container).each(function(i, item) {
						item.checked = false;
						$(item).closest('.mockup-checkbox').removeClass('on');
					});
				}
			} else {
				if(this.checked) {
					$('.data-grid-check-box[data-row-index]', self._container).each(function(i, item) {
						if(!item.checked) {
							allChecked = false;
							return false;
						}
					});
					if(allChecked) {
						$('.data-grid-check-box-all', self._container)[0].checked = true;
						$('.data-grid-check-box-all', self._container).closest('.mockup-checkbox').addClass('on');
					}
				} else {
					$('.data-grid-check-box-all', self._container)[0].checked = false;
					$('.data-grid-check-box-all', self._container).closest('.mockup-checkbox').removeClass('on');
				}
			}
			if(self._opt.onSelect) {
				self._opt.onSelect(rowIndex, this.checked, rowIndex >= 0 && self._data[rowIndex] || undefined);
			}
		});
		if(this._opt.hightLightRow) {
			this._container.delegate('[data-grid-row]', 'mouseenter', function(evt) {
				$('[data-grid-row]', self._container).removeClass('data-grid-row-hl');
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).addClass('data-grid-row-hl');
			}).delegate('[data-grid-row]', 'mouseleave', function(evt) {
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).removeClass('data-grid-row-hl');
			})
		}
		if(this._width == 'auto') {
			$(window).on('resize', this._bind.resize);
		}
	},

	_unbindEvent: function() {
		this._container.undelegate();
		if(this._width == 'auto') {
			$(window).off('resize', this._bind.resize);
		}
	},

	setColumns: function(columns) {
		var self = this;
		var checkbox = this._opt.checkbox;
		var sequence = this._opt.sequence;
		var lockedCount = 0;
		this._allColumns = columns || [];
		this._defaultLockedColumns = [];
		this._lockedColumns = [];
		this._scrollColumns = [];
		if(checkbox) {
			this._defaultLockedColumns.unshift({
				id: '__checkbox__',
				type: 'checkbox',
				width: checkbox.width || this._MIN_COLUMN_WIDTH,
				textAlign: 'center',
				locked: true
			});
		}
		if(sequence) {
			this._defaultLockedColumns.unshift({
				id: '__sequence__',
				name: sequence.name || '',
				type: 'sequence',
				width: sequence.width || this._MIN_COLUMN_WIDTH,
				textAlign: 'center',
				locked: true
			});
		}
		$.each(this._allColumns, function(i, column) {
			if(column) {
				column.width = parseInt(column.width) || 0;
				if(column.width > 0) {
					column.width = Math.min(Math.max(column.width, self._MIN_COLUMN_WIDTH), self._MAX_COLUMN_WIDTH);
				}
				if(column.locked && lockedCount < self._MAX_LOCKED_COLUMNS) {
					column.width = column.width || self._DEFAULT_COLUMN_WIDTH;
					column.width = Math.min(column.width, self._MAX_LOCKED_COLUMN_WIDTH);
					self._lockedColumns.push(column);
					lockedCount++;
				} else {
					column.locked = false;
					self._scrollColumns.push(column);
				}
			}
		});
	},

	getAllColumns: function() {
		return this._lockedColumns.concat(this._scrollColumns);
	},

	getLockedColumns: function() {
		return this._lockedColumns.concat();
	},

	getScrollColumns: function() {
		return this._scrollColumns.concat();
	},

	getSelectedData: function(dataProperty, columnId) {
		var self = this;
		var res = [];
		$('.data-grid-check-box', this._container).each(function(i, item) {
			var index = $(this).data('row-index');
			if(item.checked) {
				if(dataProperty) {
					res.push(columnId ? self._data[index][dataProperty][columnId] : self._data[index][dataProperty]);
				} else {
					res.push(columnId ? self._data[index][columnId] : self._data[index]);
				}
			}
		});
		return res;
	},

	getDataByRowIndex: function(rowIndex, dataProperty, columnId) {
		var res = this._data[rowIndex];
		if(!res) {
			return null;
		}
		if(dataProperty) {
			res = columnId ? res[dataProperty][columnId] : res[dataProperty];
		} else {
			res = columnId ? res[columnId] : res;
		}
		return res;
	},

	hightLightRow: function(index, className) {
		$('[data-grid-row="' + index + '"]', this._container).addClass(className || 'data-grid-row-error');
	},

	dehightLightRows: function(className) {
		$('[data-grid-row]', this._container).removeClass(className || 'data-grid-row-error');
	},

	resize: function(width, height) {
		if(width == 'auto' && this._width != 'auto') {
			$(window).on('resize', this._bind.resize);
		} else if(width && width != 'auto' && this._width == 'auto') {
			$(window).off('resize', this._bind.resize);
		}
		this._width = width || this._width;
		this._height = height || this._height;
		this.render();
	},

	render: function(data) {
		this._data = data || this._data;
		if(!this._data.length) {
			return;
		}
		if(this._opt.onBeforeRender) {
			this._opt.onBeforeRender();
		}
		if(this._scrollBody) {
			this._scrollBody.off('scroll', this._bind.scroll);
		}
		this._lockedBody = null;
		this._scrollHeader = null;
		this._scrollBody = null;
		var width = this._width == 'auto' ? this._holder.width() : this._width;
		if(!width && this._opt.getHolderWidth) {
			width = this._opt.getHolderWidth();
		}
		this._container.html(mainTpl.render({
			MIN_HEIGHT: this._MIN_HEIGHT,
			DEFAULT_COLUMN_WIDTH: this._DEFAULT_COLUMN_WIDTH,
			name: this._name,
			width: width,
			height: this._height,
			lockedColumns: this._defaultLockedColumns.concat(this._lockedColumns),
			scrollColumns: this._scrollColumns,
			bordered: this._opt.bordered,
			striped: this._opt.striped,
			sortColumnId: this._sortColumnId,
			sortOrder: this._sortOrder,
			checkbox: this._opt.checkbox,
			data: this._data,
			dataProperty: this._opt.dataProperty
		}));
		this._lockedBody = $('.data-grid-locked-columns .data-grid-body', this._container)[0];
		this._scrollHeader = $('.data-grid-columns .data-grid-header', this._container)[0];
		this._scrollBody = $('.data-grid-columns .data-grid-body', this._container);
		this._scrollBody.on('scroll', this._bind.scroll);
	},

	destroy: function() {
		if(this._scrollBody) {
			this._scrollBody.off('scroll', this._bind.scroll);
		}
		this._unbindEvent();
		this._container.remove();
		this._container = null;
		this._lockedBody = null;
		this._scrollHeader = null;
		this._scrollBody = null;
	}
});

return YomDataGrid;

})();

var YomDataGridTpl = (function() {
    function $encodeHtml(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    }
	var exports = {};
    exports.render = function($data, $opt) {
        $data = $data || {};
        var _$out_ = [];
        var $print = function(str) {
            _$out_.push(str);
        };
        with ($data) {
            var i, j, l, l2, column, columns, columnWidth, columnHeader, columnOffset;
            var scrollX = false;
            var scrollY = height > 0;
            var lockedTableWidth = 0;
            var scrollTableWidth = 0;
            var lockedDisplayColumns = [];
            var lockedColumnWidth = [];
            var lockedColumnHeader = [];
            var scrollDisplayColumns = [];
            var scrollColumnWidth = [];
            var scrollColumnHeader = [];
            var noWidthScrollColumns = [];
            for (i = 0, l = lockedColumns.length; i < l; i++) {
                column = lockedColumns[i];
                if (column.hidden) {
                    continue;
                }
                lockedDisplayColumns.push(column);
                lockedTableWidth += column.width;
                columnWidth = lockedColumnWidth;
                columnHeader = lockedColumnHeader;
                (function() {
                    with ($data) {
                        columnWidth.push('<colgroup><col style="width: ', column.width, 'px;"></colgroup>');
                        columnHeader.push('<th class="', column.type == "checkbox" ? "data-grid-checkbox-cell" : "", " ", i == l - 1 ? "data-grid-last-cell" : "", " data-grid-column-", column.id.replace(/\./g, "-"), '"><div class="data-grid-cell-inner" style="text-align: ', column.textAlign || "left", ';">');
                        if (column.type == "checkbox") {
                            columnHeader.push('<label class="mockup-checkbox"><input class="data-grid-check-box-all" type="checkbox" /><span><i class="icon-ok"></i></span></label>');
                        } else {
                            columnHeader.push("");
                            if (column.headerRenderer) {
                                columnHeader.push("", column.headerRenderer(column.name, i, column, sortColumnId, sortOrder), "");
                            } else if (column.sortable) {
                                columnHeader.push('<a class="data-grid-sortable" data-column-id="', column.id, '" href="javascript:void(0);" onclick="return false" title="', $encodeHtml(column.name), '">', column.name, "", sortColumnId == column.id ? sortOrder == "desc" ? '<span class="data-grid-sort-arrow-down"></span>' : '<span class="data-grid-sort-arrow-up"></span>' : "", "</a>");
                            } else {
                                columnHeader.push('<span title="', $encodeHtml(column.name), '">', column.name, "</span>");
                            }
                        }
                        columnHeader.push("</div></th>");
                    }
                })();
            }
            for (i = 0, l = scrollColumns.length; i < l; i++) {
                column = scrollColumns[i];
                if (column.hidden) {
                    continue;
                }
                scrollDisplayColumns.push(column);
                if (!column.width) {
                    noWidthScrollColumns.push(column);
                } else {
                    scrollTableWidth += column.width;
                }
                columnWidth = scrollColumnWidth;
                columnHeader = scrollColumnHeader;
                (function() {
                    with ($data) {
                        columnWidth.push('<colgroup><col style="width: ', column.width, 'px;"></colgroup>');
                        columnHeader.push('<th class="', column.type == "checkbox" ? "data-grid-checkbox-cell" : "", " ", i == l - 1 ? "data-grid-last-cell" : "", " data-grid-column-", column.id.replace(/\./g, "-"), '"><div class="data-grid-cell-inner" style="text-align: ', column.textAlign || "left", ';">');
                        if (column.type == "checkbox") {
                            columnHeader.push('<label class="mockup-checkbox"><input class="data-grid-check-box-all" type="checkbox" /><span><i class="icon-ok"></i></span></label>');
                        } else {
                            columnHeader.push("");
                            if (column.headerRenderer) {
                                columnHeader.push("", column.headerRenderer(column.name, i, column, sortColumnId, sortOrder), "");
                            } else if (column.sortable) {
                                columnHeader.push('<a class="data-grid-sortable" data-column-id="', column.id, '" href="javascript:void(0);" onclick="return false" title="', $encodeHtml(column.name), '">', column.name, "", sortColumnId == column.id ? sortOrder == "desc" ? '<span class="data-grid-sort-arrow-down"></span>' : '<span class="data-grid-sort-arrow-up"></span>' : "", "</a>");
                            } else {
                                columnHeader.push('<span title="', $encodeHtml(column.name), '">', column.name, "</span>");
                            }
                        }
                        columnHeader.push("</div></th>");
                    }
                })();
            }
            if (width > 0) {
                if (noWidthScrollColumns.length) {
                    if (width - lockedTableWidth - scrollTableWidth < noWidthScrollColumns.length * DEFAULT_COLUMN_WIDTH) {
                        for (i = 0, l = noWidthScrollColumns.length; i < l; i++) {
                            noWidthScrollColumns[i].width = DEFAULT_COLUMN_WIDTH;
                        }
                        scrollTableWidth += noWidthScrollColumns.length * DEFAULT_COLUMN_WIDTH;
                        scrollColumnWidth = [];
                        for (i = 0, l = scrollDisplayColumns.length; i < l; i++) {
                            column = scrollDisplayColumns[i];
                            scrollColumnWidth.push('<colgroup><col style="width: ', column.width || DEFAULT_COLUMN_WIDTH, 'px;"></colgroup>');
                        }
                        scrollX = true;
                    } else {
                        width = "auto";
                    }
                } else {
                    if (lockedTableWidth + scrollTableWidth > width) {
                        scrollX = true;
                    } else {
                        width = "auto";
                    }
                }
            }
            _$out_.push('<div class="data-grid ', lockedDisplayColumns.length ? "data-grid-locked" : "", " ", bordered ? "data-grid-bordered" : "", " ", striped ? "data-grid-striped" : "", '" style="overflow: hidden;"><table border="0" cellspacing="0" cellpadding="0" style="width: 100%;"><tr>');
            if (lockedDisplayColumns.length) {
                _$out_.push('<td style="width: ', lockedTableWidth, 'px;"><div class="data-grid-locked-columns" style="overflow: hidden;"><div class="data-grid-header"><table class="data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', lockedTableWidth, 'px;">', lockedColumnWidth.join(""), "<tbody><tr>", lockedColumnHeader.join(""), '</tr></tbody></table></div><div class="data-grid-body" style="', scrollX ? "overflow-x: scroll;" : "", " width: ", lockedTableWidth, "px; ", height > MIN_HEIGHT ? " height: " + height + "px;" : "", '"><table class="data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', lockedTableWidth, 'px;">', lockedColumnWidth.join(""), "<tbody>");
                columnOffset = 0;
                columns = lockedDisplayColumns;
                (function() {
                    with ($data) {
                        var item, columnValue, displayValue, title, ids;
                        for (i = 0, l = data.length; i < l; i++) {
                            item = dataProperty ? data[i][dataProperty] : data[i];
                            _$out_.push('<tr data-grid-row="', i, '" class="', i == l - 1 ? "data-grid-last-row" : "", " ", i % 2 === 0 ? "data-grid-row-odd" : "", '">');
                            for (j = 0, l2 = columns.length; j < l2; j++) {
                                column = columns[j];
                                _$out_.push('<td id="data-grid-', name, "-cell-", i, "-", j + columnOffset, '" class="', column.type == "sequence" ? "data-grid-sequence-cell" : column.type == "checkbox" ? "data-grid-checkbox-cell" : "", " ", j == l2 - 1 ? "data-grid-last-cell" : "", " data-grid-column-", column.id.replace(/\./g, "-"), '">');
                                ids = column.id.split(".");
                                columnValue = item[ids.shift()];
                                while (ids.length && columnValue) {
                                    columnValue = columnValue[ids.shift()];
                                }
                                if (column.renderer) {
                                    displayValue = column.renderer(columnValue, i, item, j + columnOffset, column);
                                } else {
                                    displayValue = $encodeHtml(columnValue || "");
                                }
                                if (column.titleRenderer) {
                                    title = column.titleRenderer(columnValue, i, item, j + columnOffset, column);
                                } else if (typeof column.title != "undefined") {
                                    if (column.title == "__content__") {
                                        title = displayValue;
                                    } else {
                                        title = column.title;
                                    }
                                } else {
                                    title = columnValue || "";
                                }
                                _$out_.push('<div class="data-grid-cell-inner" title="', $encodeHtml(title), '" style="text-align: ', column.textAlign || "left", ';">');
                                if (column.type == "sequence") {
                                    _$out_.push("", i + 1, "");
                                } else if (column.type == "checkbox") {
                                    if (checkbox && checkbox.checkable) {
                                        if (checkbox.checkable(item, i)) {
                                            _$out_.push('<label class="mockup-checkbox"><input class="data-grid-check-box" data-row-index="', i, '" type="checkbox" /><span><i class="icon-ok"></i></span></label>');
                                        } else {
                                            _$out_.push('<label class="mockup-checkbox disabled"><input type="checkbox" disabled /><span><i class="icon-ok"></i></span></label>');
                                        }
                                    } else {
                                        _$out_.push('<label class="mockup-checkbox"><input class="data-grid-check-box" data-row-index="', i, '" type="checkbox" /><span><i class="icon-ok"></i></span></label>');
                                    }
                                } else {
                                    _$out_.push("", displayValue || "&nbsp;", "");
                                }
                                _$out_.push("</div></td>");
                            }
                            _$out_.push("</tr>");
                        }
                    }
                })();
                _$out_.push("</tbody></table></div></div></td>");
            }
            if (scrollDisplayColumns.length) {
                _$out_.push('<td><div class="data-grid-columns"><div class="data-grid-header" style="', scrollY ? "overflow-y: scroll;" : "", ' width: 100%;"><table class="data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', width > lockedTableWidth ? width - lockedTableWidth + "px" : "100%", ';">', scrollColumnWidth.join(""), "<tbody><tr>", scrollColumnHeader.join(""), '</tr></tbody></table></div><div class="data-grid-body" style="', height > MIN_HEIGHT ? "overflow-y: scroll; height: " + height + "px;" : "", " ", scrollX ? "overflow-x: scroll;" : "", ' width: 100%;"><table class="data-grid-table" border="0" cellspacing="0" cellpadding="0" style="width: ', width > lockedTableWidth ? width - lockedTableWidth + "px" : "100%", ';">', scrollColumnWidth.join(""), "<tbody>");
                columnOffset = lockedDisplayColumns.length;
                columns = scrollDisplayColumns;
                (function() {
                    with ($data) {
                        var item, columnValue, displayValue, title, ids;
                        for (i = 0, l = data.length; i < l; i++) {
                            item = dataProperty ? data[i][dataProperty] : data[i];
                            _$out_.push('<tr data-grid-row="', i, '" class="', i == l - 1 ? "data-grid-last-row" : "", " ", i % 2 === 0 ? "data-grid-row-odd" : "", '">');
                            for (j = 0, l2 = columns.length; j < l2; j++) {
                                column = columns[j];
                                _$out_.push('<td id="data-grid-', name, "-cell-", i, "-", j + columnOffset, '" class="', column.type == "sequence" ? "data-grid-sequence-cell" : column.type == "checkbox" ? "data-grid-checkbox-cell" : "", " ", j == l2 - 1 ? "data-grid-last-cell" : "", " data-grid-column-", column.id.replace(/\./g, "-"), '">');
                                ids = column.id.split(".");
                                columnValue = item[ids.shift()];
                                while (ids.length && columnValue) {
                                    columnValue = columnValue[ids.shift()];
                                }
                                if (column.renderer) {
                                    displayValue = column.renderer(columnValue, i, item, j + columnOffset, column);
                                } else {
                                    displayValue = $encodeHtml(columnValue || "");
                                }
                                if (column.titleRenderer) {
                                    title = column.titleRenderer(columnValue, i, item, j + columnOffset, column);
                                } else if (typeof column.title != "undefined") {
                                    if (column.title == "__content__") {
                                        title = displayValue;
                                    } else {
                                        title = column.title;
                                    }
                                } else {
                                    title = columnValue || "";
                                }
                                _$out_.push('<div class="data-grid-cell-inner" title="', $encodeHtml(title), '" style="text-align: ', column.textAlign || "left", ';">');
                                if (column.type == "sequence") {
                                    _$out_.push("", i + 1, "");
                                } else if (column.type == "checkbox") {
                                    if (checkbox && checkbox.checkable) {
                                        if (checkbox.checkable(item, i)) {
                                            _$out_.push('<label class="mockup-checkbox"><input class="data-grid-check-box" data-row-index="', i, '" type="checkbox" /><span><i class="icon-ok"></i></span></label>');
                                        } else {
                                            _$out_.push('<label class="mockup-checkbox disabled"><input type="checkbox" disabled /><span><i class="icon-ok"></i></span></label>');
                                        }
                                    } else {
                                        _$out_.push('<label class="mockup-checkbox"><input class="data-grid-check-box" data-row-index="', i, '" type="checkbox" /><span><i class="icon-ok"></i></span></label>');
                                    }
                                } else {
                                    _$out_.push("", displayValue || "&nbsp;", "");
                                }
                                _$out_.push("</div></td>");
                            }
                            _$out_.push("</tr>");
                        }
                    }
                })();
                _$out_.push("</tbody></table></div></div></td>");
            }
            _$out_.push("</tr></table></div>");
        }
        return _$out_.join("");
    };
	return exports;
})();