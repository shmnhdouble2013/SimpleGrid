/** 
* @fileOverview TmSimpleGrid表格
* @extends  KISSY.Base
* @author  huangjia<wb_jia.huangj>
* @depends  ks-core
* @version 1.0  
* @update 2013-09-30
* @module tmSimpleGrid
* @example
*   new TmSimpleGrid('#poolTable', {
		tr_tpl: tpltr,					// tr渲染模板
		gridData:[{},{}],				// 指定数据
		isAjaxData:true,				// 是否是异步数据 默认 为false
		ajaxUrl: 'result.php',		    // 异步查询url  
		checkable: true					// 是否有checkbox
	});
*/

KISSY.add('gallery/tmSimpleGrid/1.0/', function(S, XTemplate, Store, Pagination, TL) { 
	var DOM = S.DOM,
		Node = S.Node,
		Ajax = S.IO,
		UA = S.UA,
		Event = S.Event,
		S_Date = S.Date,
        win = window,
        doc = document;		

	// 设定全局 参数 变量 
	var	CONTAINERCLS = 'j_tableContent',			// table 容器钩子

		CHECKRDIOTH = 'j_checkRdio',				// checkbox radio 列 宽度cls

		DATA_ELEMENT = 'row-element',				 // row 元素index
		CLS_GRID_ROW_SELECTED = 'grid-row-selected', // row 选中class标示
		ATTR_COLUMN_FIELD = 'data-column-field',	// 数据字段表示

		CHECKBOX_TD_INDEX = 'checkbox-index',		// 带序号的 checkbox 文字水平对齐

		CLS_GRID_ROW = 'grid-row',					// grid tr row标示
		CLS_GRID_TH = 'grid-th',					// grid th
		CLS_GRID_CELL = 'grid-cell',				// grid cell标示
		COMMAND_BTN = 'command-btn',				// 操作栏 btn 标示 -- 主要阻止 选中状态

		CHECKBOXW = '60px',  						// checkbox 显示 带有序列号 的宽度
		CHECKBOXS = '30px',							// checkbox 不显示 序号 默认 宽度
		
		DRECTION_TAGS = 'drection-tags',			// 排序字段标示
		DRECTION_ASC = 'asc',						// 升序 cls
		DRECTION_DSC = 'desc',						// 降序 cls
		
		CLS_ROW_ODD = 'odd-tr', 					// 奇数 tr cls
		CLS_ROW_EVEN = 'even-tr', 					// 偶数 tr cls
		
		CLS_CHECKBOX = 'grid-checkbox', 			// checkbox row
		
		CLS_GRID_ROW_OVER = 'grid-row-over',		// 行 mouseover class 样式
		
		SELECTALLCLS = 'j_select_all',				// 全部选中 checkbox cls钩子

		THEADCLS = '.j_thead',						// thead css 钩子
		TBODYCLS = '.j_tbody',						// tbody css 钩子
		TFOOTCLS = '.j_tfoot',						// tfoot css 钩子

		CLS_HIDDEN = '.cls-hide', 					// 是否隐藏 列 隐藏钩子

		GRIDTPL = 									
			'<div class="table-container j_tableContent">'+

				'<div>'+
					'<table class="ui-table">'+			       
					  	'<thead class="j_thead">'+		           	
				       '</thead>'+ 
				    '</table>'+
				'</div>'+

				'<div class="tbody-container">'+
					'<table class="ui-table">'+
						'<tbody class="j_tbody"></tbody>'+
				    '</table>'+
				'</div>'+ 
				
				'<div class="j_tfoot page-container"></div>'+ 

			'</div>',										// table tpl		

	    LOADMASKTPL = '<div class="loading-mask"></div>'; 	// 加载数据遮罩功能
		


	// grid 默认配置
	var POLLGRIDDEFAULT = {
			columns:[],								// row 数组 配置对象 例如：{title: 'id', width: 110, sortable: true, dataIndex: 'id'}	

			ajaxUrl: null,      					// 异步查询url  
			isJsonp: false,							// 是否 为jsonp 默认为false			

			staticData: [],							// 选择池 静态数据 

			checkable:false,						// 是否复选框 checkbox
			isShowCheckboxText: false, 				// checkbox情况下，是否th表头是否显示 全选 字符 和  checkbox 序号
			
			isPagination:true,						// 是否有分页 默认 有

			pageSize: 10, 							// 分页大小
			// isLocalPagination: false,			// 是否 本地分页

			dataField:'id',							// 单条 josn 数据 标示

			isOuterTpl: false						// 是否外部自定义 tr 模板
		}

	/**
	* 	ajaxUrl 返回数据格式
	*	{ 	
	*		"success":true,
	*		"message":"",
	*		"rows":[], 
	*		"results":0 
	*	}	

		new Store({
			url : _self.get('ajaxUrl'),
			root: 'rows',
			totalProperty: 'results', 	 // 数据条数
			params: {type:'all', id:'DJKFJDKFJ94944'}	//自定义参数
		});	
	*/	
	
	
	 /**
     * 
     * @class TmSimpleGrid
     * @constructor
     * @extends Base
     */
	function TmSimpleGrid(container, config){
		var _self = this,
			config = S.merge(POLLGRIDDEFAULT, config);

		if(!container){
			throw 'please assign the id of rendered Dom, of the container of this grid!';
			return;
		}	

		_self.container = S.get(container) ? S.get(container) : S.get('#'+container);
		

		if( !(_self instanceof TmSimpleGrid) ){
			return new TmSimpleGrid(container, config);
		}

		TmSimpleGrid.superclass.constructor.call(_self, config);		
		

		// 支持的事件
		_self.events = [
			/**  
			* 开始附加数据
			* @name Grid#beginappend 
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 附加显示的数据
			*/
			'beginappend',
			
			/**  
			* 附加数据完成
			* @name Grid#afterappend 
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 附加显示的数据
			* @param {Array} e.rows 附加显示的数据行DOM结构
			*/
			'afterappend',

			/**  
			* 开始显示数据，一般是数据源加载完数据，开始在表格上显示数据
			* @name Grid#beginshow
			* @event  
			* @param {event} e  事件对象
			*/			
			'beginshow',

			/**  
			* 显示数据完成，一般是数据源加载完数据，并在表格上显示完成
			* @name Grid#aftershow
			* @event  
			* @param {event} e  事件对象
			*/
			'aftershow',

			/**  
			* 移除行，一般是数据源移除数据后，表格移除对应的行数据
			* @name Grid#rowremoved
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			*/
			'rowremoved',

			/**  
			* 添加行，一般是数据源添加数据、加载数据后，表格显示对应的行后触发
			* @name Grid#rowcreated
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			*/
			'rowcreated',

			/**  
			* 翻页前触发 引自 mui/Pagination 分页, 转发分页事件
			* @name Grid# afterPageChanged
			* @event  
			* @return 分页信息对象
			*/
			'afterPageChanged',

			/**  
			* 行点击事件
			* @name Grid#rowclick
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			* 
			*/
			'rowclick',

			/**  
			* 单元格点击事件
			* @name Grid#cellclick
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 点击行对应的DOM对象
			*/
			'cellclick',

			/**  
			* 行双击事件
			* @name Grid#rowdblclick
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			* 
			*/
			'rowdblclick',

			/**  
			* 单元格双击事件
			* @name Grid#celldblclick
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 点击行对应的DOM对象
			*/
			'celldblclick',

			/**  
			* 行选中事件
			* @name Grid#rowselected
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			*/
			'rowselected',

			/**  
			* 行取消选中事件
			* @name Grid#rowunselected
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			*/
			'rowunselected',

			/**  
			* 行选中状态改变事件
			* @name Grid#rowselectchanged
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			* @param {Object} e.selected 选中的状态
			*/
			'rowselectchanged',			 

			/**  
			* 全选事件 发生
			* @name Grid#allRowsSelected
			* @event  
			*/
			'allRowsSelected',

			/**  
			* 取消全选事件 发生
			* @name Grid#unAllRowsSelected
			* @event  
			*/
			'unAllRowsSelected'
		];

		_self._init();
	}

	// 继承于KISSY.Base  
	S.extend(TmSimpleGrid, S.Base);
	TmSimpleGrid.VERSION = 1.0;
	S.augment(TmSimpleGrid, {

		// 控件 初始化
		_init: function(){
			var _self = this;

			_self._augmsConfig();
			_self._initStore();	
			_self._initGrid();
			_self._eventRender();
		},

		// 参数初始化
		_augmsConfig: function(){
			var _self = this;
			
		},

		// 事件初始化 -- click -- mouseout -- mouseover
		_eventRender: function(){
			var _self = this,
				hedEv = S.query('.'+CLS_GRID_TH, _self.thead);

			// thead事件 -- 前端 排序 vs 全选 
			Event.delegate(hedEv, 'click', function(ev){				
				// 前端 排序
				_self.sortableFn(ev); 

				// 全选
				_self._allSlectEvt(ev);	
			}); 
			
			// tbody事件 -- click -- mouseover -- mouseout
			S.one(_self.tbody).on('click', function (event) {				
				_self._rowClickEvent(event.target);
			}).on('mouseover', function (event) {
				_self._rowOverEvent(event.target);
			}).on('mouseout', function (event) {
				_self._rowOutEvent(event.target);
			});		

			// 转发 分页事件 afterPageChange --> afterPageChanged
			_self.pagination && _self.pagination.on('afterPageChange', function(e) {
				_self._pageChange(e);
				_self._setHeaderChecked(false);
				_self.fire('afterPageChanged', _self.store.pageInfo);
			});	


			// 行选中 vs 全选 自动匹配 
			_self.on('rowselected rowunselected', function(ev){
				_self.autoSelect(ev);
			});	

			// 纵向出现 滚动条 	
			// Event.on('', '', function(){
			// 	_self.();
			// });


			// ie 下 移除 a标签 和 input 默认虚线框		
			Event.delegate(_self.table, 'click', 'a', function(){
				this.blur();
			});
			Event.delegate(_self.table, 'click', 'input', function(){
				this.blur();
			});
		},
		
		// 初始化 table Dom 结构
		_initTableDom: function(data){
			var _self = this,
				thRow = '',
				table = DOM.create(GRIDTPL);

			// 定义全局属性 table
			_self.table = table;
				
			// 获取 -- 表格 头 体 脚  变量；
			_self.tbody = S.get(TBODYCLS, table);
			_self.thead = S.get(THEADCLS, table);
			_self.tfoot = S.get(TFOOTCLS, table);

			// 获取列配置	
			_self.columns = S.isArray(_self.get('columns')) ? _self.get('columns') : [];

			// if(data){
				thRow = DOM.create(_self._getThRowTemplate(data, 0));
			// }

			// 添加 头	
			DOM.append(thRow, _self.thead);	

			// 排序a 标签 标示 i	
			_self.sortAui = S.query('.'+DRECTION_TAGS, _self.thead);

			// 是否分页
			if(_self.get('isPagination')){
				_self.addPagePation(_self.table);
			}		
			
			// 添加遮罩div
			_self.loadingMaster(_self.table);	

			// 放入Dom树中
			DOM.append(_self.table, _self.container);
		},		


		// 纵向出现 滚动条 
		_alignTableHead: function(){
			var _self = this;


		},


		// 翻页 
		_pageChange: function(e){
			var _self = this,
				curPage = e.idx,
				storeCurrentPage = _self.store.pageInfo.currentPage;

			// 目标页数 和 当前页数一样 则退出翻页	-- 修复 pagination 加载页数 触发 afterPageChange 带来的异步数据 二次 加载数据  
			if(storeCurrentPage === curPage){
				return;
			}

			// 若是异步则为 后端分页数据 否则 改为 本地分页 数据 --- 
			if(_self.get('ajaxUrl')){					
				_self.store.load({ 		
					currentPage: curPage
				});
			}else{
				_self.store.setCurrentPage(curPage);
				
				var results = _self.store._localPagination();			
				_self.showData(results); 
			}				
		},


		//获取行的模版 -- tr
		_getRowTemplate: function (obj, index){
			var _self = this;

			var	oddCls = index % 2 === 0 ? CLS_ROW_ODD : CLS_ROW_EVEN, 				// 表格 tr 间隔颜色标示
				cellTempArray = [],
				rowTemplate = null,
				cellTemp = null,
				emptyTd = '';
			
			// 如果有 checkbox 则先添加			
			if(_self.get('checkable')) {
				cellTemp = _self._getCheckedCellTemplate(CLS_GRID_CELL, CLS_CHECKBOX, index);
				cellTempArray.push(cellTemp);
			}

			S.each(_self.columns, function (column, colindex) {
				var value = _self._getFieldValue(obj, column.dataIndex),//obj[column.dataIndex.*.*],
					text = _self._getRenderText(column, value, obj),
					temp = _self._getCellTemplate(colindex, column, text);

				cellTempArray.push(temp);
			});

			rowTemplate = ['<tr rowIndex="', index, '" class="', CLS_GRID_ROW, ' ', oddCls,'">', cellTempArray.join(''), emptyTd, '</tr>'].join('');
			
			return rowTemplate;
		},

		//获取单元格的模版 -- td
		_getCellTemplate: function (index, column, text){
			var _self = this,
				width = _self.setPxCheck(column.width),
				dataIndex = column.dataIndex,
				hideText = column.hide ? CLS_HIDDEN : '',
				template = ['<td width="'+width+'" class="', CLS_GRID_CELL, hideText, '" colindex="', index, '" data-field="',dataIndex,'">', text, '</td>'].join('');
			
			return template;
		},

		// 有checkbox 复选框 -- td checkbox
		_getCheckedCellTemplate: function(clscell, clsCheck, index){
			var _self = this,
				currentPage = _self.store.getCurrentPage(),
				pageSize = _self.store.getPageSize(), 
				emptyTd = ' ',
				defWidth,
				aindex = '';

			if(_self.get('isShowCheckboxText')){
				defWidth = CHECKBOXW;
				index = ++index;
				aindex = currentPage === 1 ? index : pageSize*(currentPage-1) + index;
			}else{
				defWidth = CHECKBOXS;
			}
				
			return '<td width="'+defWidth+'" class="'+clscell+emptyTd+CHECKBOX_TD_INDEX+'"><input type="checkbox" value="" name="checkboxs" class="'+clsCheck+'">'+aindex+'</td>';
		},	

		/**
		* 获取行的模版 -- th
		* @param {obj || string} 表格 数据对象 和 相应的index
		* @return {string} 包含th的 tr html字符串
		*/
		_getThRowTemplate: function(obj, index){
			var _self = this;

			// 只渲染 tr th 头即可
			if(index > 1){
				return;
			}

			var	cellTempArray = [],
				rowTemplate = null,
				cellTemp = null,
				thTpl = '',
				emptyTd = ' ',
				defWidth = _self.get('isShowCheckboxText') ? CHECKBOXW : CHECKBOXS,	
				selectAllText = _self.get('isShowCheckboxText') ? '全选': ''; // 是否显示 全选 字符
			
			// 复选框	
			if( _self.get('checkable') ){
				thTpl = '<th width="'+defWidth+'" class="'+CLS_GRID_TH + emptyTd +'"><input type="checkbox" value="" name="checkboxs" class="'+SELECTALLCLS+'" data-field="">'+selectAllText+'</th>';
				cellTempArray.push(thTpl);
			}		

			S.each(_self.columns, function(column, index) {
				var value = _self._getFieldValue(column, column.dataIndex), //obj[column.dataIndex.*.*],
					text = _self._getRenderText(column, value, obj),
					temp = _self._getThTemplate(column, text, value);

				cellTempArray.push(temp);
			});

			rowTemplate = ['<tr rowIndex="', index, '" class="', CLS_GRID_ROW, '">', cellTempArray.join(''), emptyTd, '</tr>'].join('');
			
			return rowTemplate;
		},

		/**
		* 获取 th html
		* @param {obj||string} 列配置数据项obj、render方法html、dataIndex获取的值
		* @return {string} th html
		*/
		_getThTemplate: function(obj, text, value){
			var _self = this;
				
			var	hideCls = obj.hide ? CLS_HIDDEN : '',
				width = _self.setPxCheck(obj.width),
				title = obj.title,
				isSortCols = obj.sortable,
				dataIndex = obj.dataIndex,				
				text = title || text,
				emptyTd = ' ',
				thTpl = '',
				thAry = [];	
			
			// 支持 string || float || int || date
			var dataType = obj.dataType || S.TL.strToDataType(value) || 'string';	

			// 有无排序
			if(isSortCols){
				thTpl = '<th width="'+width+'" class="'+CLS_GRID_TH + emptyTd + hideCls+'"><a href="javascript:void(0)" title="点击排序" data-field="'+dataIndex+'" data-dataType="'+dataType+'">'+text+'<i class="'+DRECTION_TAGS+'">&nbsp;</i></a></th>';
				thAry.push(thTpl);
			}else{
				thTpl = '<th width="'+width+'" class="'+CLS_GRID_TH + emptyTd + hideCls+'" data-field="'+dataIndex+'">'+text+'</th>';
				thAry.push(thTpl);
			}	

			return thAry.join('');
		},	

		
		
		// 根据 数据勾选状态, 自动判断 全选与否 显示状态
		autoSelect: function(ev){
			var _self = this,
				type = 	ev.type;

			if(type === 'rowselected'){
				_self._isAllRowsSelected() && _self._setHeaderChecked(true);
			}else{
				_self._setHeaderChecked(false); 
			}
		},

		sortableFn: function(ev){
			var _self = this,
				direction = '',
				itagIndex = DOM.first(ev, 'i'),
				field = DOM.attr(ev, 'data-field'),
				cssCls = DOM.attr(itagIndex, 'class'),
				dataType = DOM.attr(ev, 'data-dataType'),
				isSort = DOM.hasClass(itagIndex, DRECTION_TAGS);
				
			if(!isSort){
				return;
			}
			
			// 第一次点击 vs 后续点击
			if(cssCls === DRECTION_TAGS){
				direction = (_self.store.sortInfo.direction).toLowerCase() === DRECTION_ASC ? DRECTION_DSC : DRECTION_ASC; // 获取store默认排序方式 asc 升序
			}else{
				direction = DOM.hasClass(itagIndex, DRECTION_ASC) ? DRECTION_DSC : DRECTION_ASC;
			}
			
			_self.store.sort(field, direction.toLocaleUpperCase(), dataType); 	
			
			// 移除所有 排序标记标示  -- 显示当前 排序标记 
			S.each(_self.sortAui, function(tag){
				DOM.removeClass(tag, DRECTION_ASC);
				DOM.removeClass(tag, DRECTION_DSC);
			});			
			DOM.addClass(itagIndex, direction);
		},
		
		// 根据路径 获取对象值
		_getFieldValue: function(obj, dataIndex){
			var _self = this;

			if(!dataIndex){
				return '';
			}
	    	var arr = dataIndex.split('.'),
	    		curObj = obj,
	    		result;

	    	if(arr.length<2){
	    		result = curObj[dataIndex];
	    	}else{
	    		S.each(arr, function(name){
		    		if(curObj){
		    			result = curObj[name];
		    			curObj = result;
		    		}else{
		    			return false;
		    		}
		    	});
	    	}

	    	return result;
	    },

		// 获取格式化的数据
        _getRenderText : function(column, value, obj){
        	var _self = this,
            	text = value,
            	fn = column.renderer,
            	domRender = S.isFunction(fn) ? fn : null;

            if(domRender){
                try{
                    text = domRender(value, obj);
                }catch(ex){
                    S.error('renderer error, occurred in column: ' + column.title);
                }
            }
            return text;
        },

		// 初始化gird 和 分页器
		_initGrid: function(){
			var _self = this,				
				width = _self.get('width'),
				height = _self.get('height');							
			
			// 载入 基本table结构
			_self._initTableDom();		

			// 如果异步 则异步加载数据，否则加载 静态数据 --Store
			if(_self.get('ajaxUrl')){
				_self.store.load();
			}else if(_self.get('staticData')){	
				_self.store.setResult( _self.get('staticData') );				
			}else{
				throw 'Grid Data Source Error!';
			}	
			
			// 设置Grid Body的 宽高 度
			if(width) { 			
				_self.setWidth(width);
			}
			if (height) { 			
				_self.setHeight(height);
			}
		},
		
		// 初始化Store jsonp
		_initStore: function(data){
			var _self = this,
				dataType = _self.get('isJsonp') ? 'jsonp': 'json';

			// 初始化Store 指定 url、是否jsonp、	若有分页(分页大小 和 分页总数)
			_self.store = new Store({ 
				url: _self.get('ajaxUrl'),
				dataType: dataType,
				limit: _self.get('pageSize'), 
				localSort: _self.get('isLocalSort'),
				isPagination: _self.get('isPagination') 
				// localPagination: _self.get('isLocalPagination')	
			});
			
			// 若无store则推出绑定
			if(!_self.store){
				return;
			}
			
			// 准备加载数据前 --- 添加 屏幕遮罩 delay
			_self.store.on('beforeload', function(){
				if (_self.loadMask) {
					_self.loadMask.show();
				}
			});
			
			// 数据加载完成后 - 取消 屏幕遮罩 delay
			_self.store.on('load', function(obj){
				var data = obj.data,
					curPage = this.getTotalPage(),
					results = this.getResult();			
			
				_self.showData(results); 	

				// 更新分页 实时总数 -- 会触发 pagination  afterChange事件 上述已规避有此带来的异步二次加载
				if(_self.pagination){		
					_self.pagination.setTotalPage(curPage);
				}	

				if(_self.loadMask) {
					_self.loadMask.hide();
				}
			});

			// 添加数据时触发该事件
			_self.store.on('addrecords', function (event) {
				var data = event.data;
				_self.appendData(data);
			});

			// 删除数据是触发该事件
			_self.store.on('removerecords', function (event) {
				var data = event.data;
				_self.removeData(data);				
			});

			// 出错时候
			_self.store.on('exception', function () {
				if (_self.loadMask) {
					_self.loadMask.hide();
				}
			});
			
			// 前端排序发生
			_self.store.on('localsort', function(){
				var results = this.getResult();			
				_self.showData(results); 
			});
		},
		

		// 设置Grid Body的宽度
		setWidth: function(width){
			var _self = this,				
				outerWidth = DOM.width(_self.container), 
				width = parseInt( _self.setPxCheck(width) );
				
			if(width ){ // && width >= outerWidth
				DOM.css(_self.table, 'width', width+'px' );
			}
		},

		// 设置Grid Body的高度
		setHeight: function(height){
			var _self = this,
				tbodyContainer = S.get('.tbody-container', _self.container), 
				theadHeight = DOM.height(_self.thead), 
				tfootHeight = DOM.height(_self.tfoot), 
				height = parseInt( _self.setPxCheck(height) ),
				height = height - theadHeight - tfootHeight;

			if(height>0){ //  && height >= outerHeight
				DOM.css(tbodyContainer, 'height', height+'px' );
			}	
			_self.tbodyContainer = tbodyContainer;
		},
		
		// 公共 设定 像素宽高过滤函数
		setPxCheck: function(px){
			var _self = this,
				endVaue = 'auto';				

			if(!px){
				return; 
			}

			// 如果等于auto
			if(S.trim(px) === endVaue){
				return endVaue;
			}

			if(S.isNumber(px)){
				endVaue = px+'px';
			}else if(S.isString(px)){

				var isPercentage = px.split('%'),
					hasPx = px.split('px');

				if(isPercentage.length>1){
					console.log('The percentage of CSS values is not supported!'); 
					return;
				}	

				if(hasPx.length>1){					
					endVaue = px;
				}
			}else{
				console.log('Invalid height or width value!'); 
			}

			return endVaue;
		},

		// 添加分页
		addPagePation: function(container){
			var _self = this;

			if(!container){
				return;
			}	

			var pagContainer = S.get('.page-container', container);

			// 初始化
			_self.pagination = new Pagination({
				container: pagContainer
			});
			// 防止 分页 表单提交
		    Event.delegate(pagContainer, 'submit', 'form', function(e){
		       	e.preventDefault();
		    });
		},

		// 手动 强制 设定 分页总数
		_enforcePageTal: function(totalPage){
			var _self = this,
				totalPage = _self.store.getTotalPage(),
				totalPage = S.isNumber(totalPage) ? totalPage : parseInt(totalPage, 10);

			if(totalPage<1){
				totalPage = 1;
			}

			if(totalPage > totalPage){
				totalPage = totalPage;
			}
			
			if(totalPage !== totalPage && _self.pagination){				
				_self.pagination.setTotalPage(totalPage);
				_self.store.setTotalPage(totalPage);
			}			
		},

		// 添加遮罩功能 -- 自定义模板
		loadingMaster: function(tableContainer){
			var _self = this,
				mastNode = DOM.create( _self.get('maskTpl') || LOADMASKTPL);

			if(mastNode){
				DOM.prepend(mastNode, tableContainer);
				_self.loadMask = S.one(mastNode);
			}				
		},


		// 全选事件
		_allSlectEvt: function(target){
			var _self = this,
				hasAllSelect = DOM.hasClass(target, SELECTALLCLS);
				
			if(hasAllSelect){					
                _self._setAllRowsSelected(target.checked);
			}
		},
		
				
		// 查找 row
		_findRow: function (element) {
			return this._lookupByClass(element, CLS_GRID_ROW);
		},	
		
		// 查找 cell
		_findCell: function (element) {
			return this._lookupByClass(element, CLS_GRID_CELL);
		},
		
		// 通过class查找方法，若木有则返回父容器下的样式元素 td tr
		_lookupByClass: function(element, css){
			if(DOM.hasClass(element, css)) {
				return element;
			}
			return DOM.parent(element, '.' + css);
		},
		
		// row是否选中
		_isRowSelected: function(row) {
			return S.one(row).hasClass(CLS_GRID_ROW_SELECTED);
		},
		
		// 行 click 事件
		_rowClickEvent: function (target) {
			var _self = this,
				isBtn = DOM.hasClass(target, COMMAND_BTN),
				row = _self._findRow(target),
				cell = _self._findCell(target),
				rowCheckable = _self.get('checkable'), // 是否有checkbox				
				data = null,
				eventResult = null;
				
			if(row){
				data = DOM.data(row, DATA_ELEMENT);
				
				if(cell){
					eventResult = _self.fire('cellClick', {data: data, row: row, cell: cell, field: DOM.attr(cell, ATTR_COLUMN_FIELD), domTarget: target});
					if(eventResult === false){ // 如果事件出错，则退出
						return;
					}
				}
				_self.fire('rowclick', {data: data, row: row});
				
				// 如果是 btn
				if(isBtn){
					return;
				}
				
				// 设置行选中状态
				if(rowCheckable){// checkbox
					if(!_self._isRowSelected(row)) {
						_self._setRowSelected(row, true);						
					}else{
						_self._setRowSelected(row, false);
					}
				}
			}
		},
		
		// 行的双击事件
		_rowDoubleClickEvent: function(target){
			var _self = this,
				row = _self._findRow(target),
				cell = _self._findCell(target),
				data = null;
			if (row) {
				data = DOM.data(row, DATA_ELEMENT);
				if(cell) {
					_self.fire('celldblclick', {data : data, row : row, cell : cell, field : DOM.attr(cell, ATTR_COLUMN_FIELD), domTarget : target});
				}
				_self.fire('rowdblclick', {data : data, row : row});
			}
		},
		
		//行的 mouseover 事件
		_rowOverEvent : function (target) {
			var _self = this,
				row = _self._findRow(target);
				
			if(row) {
				S.one(row).addClass(CLS_GRID_ROW_OVER);
			}
		},
		
		//行的 mouseout 事件
		_rowOutEvent : function (target) {
			var _self = this,
				row = _self._findRow(target);
			if (row) {
				S.one(row).removeClass(CLS_GRID_ROW_OVER);
			}
		},		
		
		/**
		* 显示数据
		* @param {Array} data 显示的数据
		* 
		*/		
		showData : function (data) {
			var _self = this,
				trs = [];

			_self.fire('beginshow');

			_self.clearData();

			S.each(data, function (obj, index) {
				trs.push(_self._createRow(obj, index));
			});

			// _self._afterShow(); 自适应宽高 方法
			
			DOM.html(_self.tbody, trs.join(''));
			
			_self.fire('aftershow');
		},

		/**
		* 清空表格
		*/
		clearData : function(){
			var _self = this,
				rows = _self.tbody.rows;

			// 移除行，一般是数据源移除数据后，表格移除对应的行数据	
			S.each(rows, function(row){
				_self.fire('rowremoved', {data : DOM.data(row, DATA_ELEMENT), row : row} );
			});

			S.all(rows).remove();
		},

		/**
		* render table Dom  -- 支持 用户 自定义table 页面, tr模板 和 默认内建默认整套模板
		*/
		_createRow : function(element, index) {
			var _self = this,				
				rowTemplate = '';				

			if(_self.get('isOuterTpl')){
				rowTemplate = _self.trRender(element, _self.get('trTpl') );
			}else{
				rowTemplate = _self._getRowTemplate(element, index);
			}	

			var rowEl = new Node(rowTemplate),
				dom = rowEl.getDOMNode();

			DOM.data(dom, DATA_ELEMENT, element);
			_self.fire('rowcreated',{data: element, row: dom});

            return rowTemplate;
		},

		/**
		* 移除数据
		* @private
		* @param {Array} data 移除的数据
		* 
		*/
		removeData : function (data) {
			var _self = this,
				rows = S.makeArray(_self.tbody.rows);

            S.each(rows, function (row) {
                var obj = DOM.data(row, DATA_ELEMENT);
                if (obj && S.inArray(obj, data)) {
					_self.fire('rowremoved',{data: obj, row: row});
					DOM.remove(row);
                }
            });
		},

		/**
		* 附加数据 不依赖store 根据数据渲染表格
		* @private
		* @param {Array} data 添加到表格上的数据
		*/
		appendData : function (data) {
			var _self = this,
				rows = [];
				// count = _self._getRowCount();

			_self.fire('beginappend',{data : data});
			S.each(data, function (obj, index) {
				var row = _self._createRow(obj, index);  // count + index
				rows.push(row);
			});
			_self.fire('afterappend', {rows : rows, data : data});
		},

		// 渲染 -- 公用方法
		tplRender: function(data, tpl){
    		var _self = this,
    			htmlText,
    			creatNode;

    		if(!tpl){
				throw 'Template is undefined!';    
			}

    		try{
    			htmlText = new XTemplate(tpl).render(data);
    			creatNode = DOM.create(htmlText);
    		}catch(e){
    			throw e;			
    		}

    		return creatNode;
    	},
		
		/**
		* 取消选中的记录 
		*/
		clearSelection : function(){
			var _self = this;
			
			_self._setAllRowsSelected(false);
			_self._setHeaderChecked(false);
		},
		
				
		//设置表头选中状态
		_setHeaderChecked: function (checked) {
			var _self = this,
				checkEl = S.one('.'+SELECTALLCLS, _self.thead);
			
			if(checkEl) {
				checkEl.attr('checked', checked);
			}
		},
		
		//设置row 全选
		_setAllRowsSelected: function (selected) {
			var _self = this;			
			
			S.each(_self.tbody.rows, function(row) { 
				_self._setRowSelected(row, selected);
			});

			if(selected){
				_self.fire('allRowsSelected'); 
			}else{
				_self.fire('unAllRowsSelected');
			}
		},

		// 纯根据 外界 传入的 data --- 设定表格中的 对应的row选中状态
		_setDataSelect: function(data, isSelected){
			var _self = this;

			if(!data || isSelected == undefined){
				console.log('必须传入相应数据或选中状态');
				return;
			}

			data = S.isArray(data) ? data : [data];

			S.each(data, function(obj){
				transition(obj, isSelected);
			});
			
			function transition(obj, isSelected){
				S.each(_self.tbody.rows, function(row){
					_self._setLockRecords(row, obj, isSelected);
				});
			}
		},

		// 设定表格 选中状态 --带锁定
		_setLockRecords: function (row, compareData, selected){
			var _self = this,
				data = DOM.data(row, DATA_ELEMENT),
				isFind = _self.store.matchFunction(data, compareData);

			if(isFind) { 
				_self.setSelectLock(row, selected);		
			}		
		},
		
		// 锁定rows状态
		_isLocalRows: function(rows, isDisabled){
			var _self = this;
			
			rows = S.isArray(rows) ? rows : [rows];
			
			S.each(rows, function(row){
				var checkbox = DOM.get('.'+CLS_CHECKBOX, row),
					data = DOM.data(row, DATA_ELEMENT);
			
				// 禁用复选 保持选中状态
				if(checkbox){
					DOM.attr(checkbox, 'disabled', isDisabled);
				}			
			});						
		},

		// 设定选中情况 及 锁定情况
		setSelectLock: function(row, selected){
			var _self = this,
				checkbox = DOM.get('.'+CLS_CHECKBOX, row),
				isDisabled = DOM.attr(checkbox, 'disabled');
			
			// 若是锁定状态，首选解锁			
			if(isDisabled) {
				DOM.attr(checkbox, 'disabled', false);
			}
			
			// 设定选中 及 锁定 状态
			_self._setRowSelected(row, selected);		
			_self._isLocalRows(row, selected);	
		},


		//是否row全部选中
		_isAllRowsSelected: function(){
			var _self = this,
				rows = _self.tbody.rows,
				val = true;

			if(rows.length<1){
				return;
			}else{
				S.each(rows, function(row) { 
					if( !_self._isRowSelected(row) ){
						val = false;
					}
				});				
				return val;		
			}					
		},

		
		/**
		* 获取选中的数据
		* @return {Array} 返回选中的数据
		*/
		getSelection : function(){
			var _self = this,
				selectedRows = S.all('.' + CLS_GRID_ROW_SELECTED, _self.tbody),
				objs = [];

			S.each(selectedRows, function(row) {
				var obj = DOM.data(row, DATA_ELEMENT);
				if(obj) {
					objs.push(obj);
				}
			});
			return objs;
		},
		
		// 设置行选择
		_setRowSelected : function (row, selected) {
			var _self = this,
				checkbox = DOM.get('.'+CLS_CHECKBOX, row),
				data = DOM.data(row, DATA_ELEMENT),
				hasSelected = DOM.hasClass(row, CLS_GRID_ROW_SELECTED);
				
			if(hasSelected === selected) {
				return;
			}
			
			if(checkbox) {
				//如果选择框不可用，此行不能选中
				if(DOM.attr(checkbox,'disabled')){
					return;
				}
				checkbox.checked = selected;
			}
			
			if(selected) {
				DOM.addClass(row, CLS_GRID_ROW_SELECTED);
				_self._onRowSelectChanged(row, selected);
			}else{
				DOM.removeClass(row, CLS_GRID_ROW_SELECTED);
				_self._onRowSelectChanged(row, selected);
			}
		},
		
		// 触发行选中，取消选中事件
		_onRowSelectChanged : function(row, selected){
			var _self = this,
				data = DOM.data(row, DATA_ELEMENT);
				
			if(selected){
				_self.fire('rowselected', {data : data, row : row, type:'rowselected'}); 
			}else{
				_self.fire('rowunselected', {data : data, row : row, type:'rowunselected'});
			}
			_self.fire('rowselectchanged', {data : data, row : row, selected : selected});
		}
	
	});

return TmSimpleGrid;

}, {'requires':['xtemplate', 'gallery/tmSimpleGrid/1.0/store', 'mui/pagination', 'gallery/tmSimpleGrid/1.0/TL','sizzle']}); 
