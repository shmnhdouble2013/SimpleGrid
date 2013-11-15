## 综述

SimpleGrid是一个方便灵活的kissy Grid表格组件，将带给您: 同步|异步|的数据展现 和 排序|分页基本功能，提供 丰富的事件监控 和 增删查等数据处理 等操作,你将立马喜欢上她!

* 版本：1.0
* 作者：水木年华double
* 标签: 
* demo：[查看一个简单的示例Demo](http://gallery.kissyui.com/tmSimpleGrid/1.0/demo/index.html)

## 一个综合的 快速配置示例：
<pre class="prettyprint prettyprinted">
	<code>

	// 静态数据
	var selectData = [
            {"nos":52, "id":"fa32f3a2f5", "actype":"站外", "medianame":"youku.com", "time":5343543758045},
            {"nos":71, "id":"faf262f6a66_1", "actype":"站外7", "medianame":"youku7.com","time":5343545453758584},
            {"nos":11, "id":"afa266969fa_2", "actype":"站外11", "medianame":"youku11.com","time":5343944754584 }
        ]; 

    // 调用组件 初始化    
    KISSY.use('gallery/tmSimpleGrid/1.0/index', function (S, TmSimpleGrid) {

        var tmSimpleGrid = new TmSimpleGrid('#container', {

            // width:"500px",					// 强制设定 表格 高度，支持3种配置： 1、1000  2、'1000px' 3、'auto'  ps:不传递参数 默认进行自适应
            // height:400,						// 表格高度， 其他同上	

			// ajaxUrl: 'result.php', 			// 异步接口 
			// isJsonp: false,					// 是否 为jsonp 默认为false	

			staticData: selectData, 			// table 静态数据，当ajaxUrl同时存在时候，优先异步数据

			// isLocalSort: false, 				// 是否本地排序，默认本地排序 --  另外，开启排序列请在下面columns里配置sortable, 以及指定dataType 排序数据类型

			checkable: true,					// 是否 开启 复选框 checkbox ---- 默认 false 不显示，注意 此配置不开启则isShowCheckboxText 显示文字无效
			// isShowNoText: false, 				// checkbox情况下，是否th表头是否显示 全选 字符 和 checkbox 序号, 默认 false 不显示
				
			pageSize:6, 						// 分页大小  默认10条/页; ps:异步情况下，后端 分页数据，反之则自动 前端 本地分页 

			/*
			*  title   		th显示字段
			*  width		表格宽度
			*  sortable		是否排序
			*  dataType		排序数据类型(float || int || date|)，默认string 
			*  dataIndex	表格数据字段 key， 支持 多层数据嵌套路径,比如：'a.b.c.d.f.d' ...
			*/
			columns: [				
				{title: 'id', width: '150px', sortable: true, dataType: 'float', dataIndex: 'id'},
				{title: '活动类型',width: 'auto', sortable: true, dataType: 'string', dataIndex: 'actype'},
				{title: '媒体名称',width: 'auto', sortable: false, dataType: 'string', dataIndex: 'medianame'},
				{title: '时间',width: 'auto', sortable: false, dataType: 'int', dataIndex: 'time', renderer: S.TL.datetimeRenderer},					
				{title: '操作', width: '.', sortable: false, dataIndex: '', renderer: function(value, obj){ 

					// 操作 标示 command-btn
					return '<a href="javascript:void(0)" class="command-btn">编辑</a>';
				}}
			] 

		});
    });
	<code>
</pre>


## SimpleGrid API说明 -------------------------------------------------------------


## 异步表格数据
<pre class="prettyprint prettyprinted">
	<code>
		{
			"rows":[			// 表格数据 rows
				{"name":"abc"},
				{"name":"bcd"}
			],

			"results":100      // 数据条数 不传递 默认计算 rows数组 数据条数
		}
	</code>
</pre>	

## 静态 同步 表格数据 -- 单独数组
<pre class="prettyprint prettyprinted">
	<code>
		[			
			{"name":"abc"},
			{"name":"bcd"}
		]
	</code>
</pre>	

<fieldset class="preview"><legend>描述</legend>	
   
	<p>SimpleGrid 基本方法</p>
	<pre> 
		/**
		* 仅仅只 显示 表格数据(不启用Store管理对象、无自动分页/排序 功能) 
		* @method showData(data)
		* @param {Array} data 显示的数据
		* @example SimpleGrid.showData([{"a":1,"b":2}]);
		*/	

		/**
		* 清空表格数据
		* @method clearData();
		* @param {} 
		* @example SimpleGrid.clearData();
		*/

		/**
		* 锁定rows checkbox 状态
		* @method isLocalRows(rows, isDisabled)
		* @param {rows} trRow 单个 或 数组
		* @param {isDisabled} Boolean 是否锁定操作
		* @example SimpleGrid.isLocalRows(row, true);
		* @return {null} 
		*/

		/*
		* 是否row全部选中
		* @method isAllRowsSelected();
		* @return {boolean}
		* @example SimpleGrid.isAllRowsSelected();
		**/
		
		/*
		* 根据 传入data --- 设定表格中的 对应的row选中状态 默认比较数据 id
		* @method  setDataSelect(data, isSelected);
		* @param {obj || array} 设定数据
		* @param {boolean} 是否选中
		* @example SimpleGrid.setDataSelect({"a":3}, true);
		**/ 

		/**
		* 获取选中的数据
		* @method getSelection();
		* @return {Array} 返回选中的数据
		* @example SimpleGrid.getSelection();
		*/

	</pre> 
	<p>SimpleGrid 事件</p>
	<pre>   
		/**  
		* 开始显示数据，一般是数据源加载完数据，开始在表格上显示数据
		* @name SimpleGrid#beginshow
		* @event  
		* @param {event} e  事件对象
		*/			
		'beginshow',

		/**  
		* 显示数据完成，一般是数据源加载完数据，并在表格上显示完成
		* @name SimpleGrid#aftershow
		* @event  
		* @param {event} e  事件对象
		*/
		'aftershow',

		/**  
		* 添加行，一般是数据源添加数据、加载数据后，表格显示对应的行后触发
		* @name SimpleGrid#rowcreated
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 行对应的DOM对象
		*/
		'rowcreated',

		/**  
		* 翻页前触发 引自 mui/Pagination 分页, 转发分页事件
		* @name SimpleGrid# afterPageChanged
		* @event  
		* @return 分页信息对象
		*/
		'afterPageChanged',

		/**  
		* 行点击事件
		* @name SimpleGrid#rowclick
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 行对应的DOM对象
		* 
		*/
		'rowclick',

		/**  
		* 单元格点击事件
		* @name SimpleGrid#cellclick
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 点击行对应的DOM对象
		*/
		'cellclick',

		/**  
		* 行双击事件
		* @name SimpleGrid#rowdblclick
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 行对应的DOM对象
		* 
		*/
		'rowdblclick',

		/**  
		* 单元格双击事件
		* @name SimpleGrid#celldblclick
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 点击行对应的DOM对象
		*/
		'celldblclick',

		/**  
		* 行选中事件
		* @name SimpleGrid#rowselected
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 行对应的DOM对象
		*/
		'rowselected',

		/**  
		* 行取消选中事件
		* @name SimpleGrid#rowunselected
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 行对应的DOM对象
		*/
		'rowunselected',

		/**  
		* 行选中状态改变事件
		* @name SimpleGrid#rowselectchanged
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 行对应的记录
		* @param {Object} e.row 行对应的DOM对象
		* @param {Object} e.selected 选中的状态
		*/
		'rowselectchanged',			 

		/**  
		* 全选事件 发生
		* @name SimpleGrid#allRowsSelected
		* @event  
		*/
		'allRowsSelected',

		/**  
		* 取消全选事件 发生
		* @name SimpleGrid#unAllRowsSelected
		* @event  
		*/
		'unAllRowsSelected'
	</pre> 

	<p>SimpleGrid 其他信息</p>
	<pre>       
      	/**
		* 排序信息 
		* @field 3个字段 -- 排序字段、排序方向 ASC/DESC、排序数据类型 (float || int || date|)，默认string  异步排序展现， 在columns里配置
		* @type Object
		* @default { field: '', direction: 'ASC', dataType: 'string' }
		*/

        /**        
		* josn 数据 - 根据 指定字段 验证2条数据是否相同
		* @ field string
		* @ default 'id'
		* @ dataField: 'id'
		*/
	</pre>
		
	<p>数据对象 store Event事件方法：</p>
	<pre> 
		/**  
		* 当数据加载完成后
		* @name Store#load  
		* @event  
		* @param {event} e  事件对象，包含加载数据时的参数
		*/
		'load',

		/**  
		* 当数据加载前
		* @name Store#beforeload
		* @event  
		*/
		'beforeload',

		/**  
		* 发生在，beforeload和load中间，数据已经获取完成，但是还未触发load事件，用于获取返回的原始数据
		* @name Store#beforeProcessLoad
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.data 从服务器端返回的数据
		*/
		'beforeProcessLoad',
		
		/**  
		* 当添加数据时触发该事件
		* @name Store#addrecords  
		* @event  
		* @param {event} e  事件对象
		* @param {Array} e.data 添加的数据集合
		*/
		'addrecords',

		/**
		* 抛出异常时候
		*/
		'exception',

		/**  
		* 前端发生排序时触发
		* @name Store#localsort
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.field 排序的字段
		* @param {Object} e.direction 排序的方向 'ASC'，'DESC'
		*/
		'localsort',

		/**  
		* 当禁用某条数据时触发该事件
		* @name Store#disableRecords  
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.record 禁用的数据对象
		*/
		'disableRecords',

		/**  
		* 当解禁某条数据时触发该事件
		* @name Store#cancelDisableRecords  
		* @event  
		* @param {event} e  事件对象
		* @param {Object} e.record 解禁的数据对象
		*/
		'cancelDisableRecords',

		/**  
		* 总页数改变 totalPageChange 事件
		* @name Store#totalPageChange  
		* @event  
		* @param {event} e  事件对象
		* @return {obj} 返回 分页信息 对象
		*/
		'totalPageChange'
	</pre>	

	<p>附： S.TL内置工具方法对象</p>
	<pre>  
		/**
		@description 日期格式化函数
		@method dateRenderer(d);
		@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
		@return {String} 格式化后的日期格式为 2011-10-31
		@example
		* 一般用法：
		* S.TL.Format.dateRenderer(1320049890544);输出：2011-10-31 <br>
		* 表格中用于渲染列：<br>
		* {title:"出库日期",dataIndex:"date",renderer:S.TL.Format.dateRenderer}
		*/
		
		/**
		@description 日期时间格式化函数
		@method datetimeRenderer(d);
		@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
		@return {String} 格式化后的日期格式时间为 2013-11-13 17:17:35
		@example S.TL.Format.datetimeRenderer(1384334266183); 输出：2013-11-13 17:17:35
		*/

		/*
		* @description 根据日期时间字符串 返回日期对象
		* @menthod getDateParse(dateStr);
		* @param {String} 2013-11-13 17:17:35
		* @return {obj} date obj 
		* @example S.TL.Format.getDateParse('2013-11-13 17:17:35'); 输出：date obj
		*/

		/*
		* @description 根据字符串日期, 前后推移 天数
		* @method getOffsetDateObj(dateStr, offset, PreviousLate);
		* @param {Number|String}  
		* @return {obj} date obj 
		* @param { '+' || '-'} 向后 或者 向前 推移时间
		* @example S.TL.Format.getOffsetDateObj('2013-11-13 17:17:35', 1, '+');
		*/

		/*
		* @description 将财务数据分转换成元
		* @method moneyCentRenderer(v, fixed);
		* @param {Number|String}  字符串 或者 数字 分
		* @param {Number} 保留小数点儿位数(默认2位小数)
		* @return {Number} 返回将 分转换成 元的数字
		* @example S.TL.Format.moneyCentRenderer(1000); ---> 10.00
		*/

		/**
		* encodeURI 异步参数
		* method encodeURIParam(vals, isDoubEncode);
		* @param  {String || array || json, Boolean} 将要encodeURI 内容，是否2次转码Boolean值
		* @return {String || array || json} encodeURI 后的 值
		* @example S.TL.encodeURIParam("商品名称");   输出: "%E5%95%86%E5%93%81%E5%90%8D%E7%A7%B0"
		*/

	</pre>  	
  </fieldset>


