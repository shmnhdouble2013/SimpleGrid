## 综述

tmSimpleGrid是一个非常丰富、方便灵活的kissy Grid表格组件，将带给您: 同步|异步|排序|分页|事件|事件操作|数据处理 等方面的丰富体验。

* 版本：1.0
* 作者：水木年华double
* 标签：Beta
* demo：[查看demo](http://gallery.kissyui.com/tmSimpleGrid/1.0/demo/index.html)

## 初始化组件

	demo ../demo/index.html



    S.use('gallery/tmSimpleGrid/1.0/index', function (S, TmSimpleGrid) {
        var tmSimpleGrid = new TmSimpleGrid('#container' , {
			// ajaxUrl: 'result.php', 						// 异步接口 result.php   result_jsonp.php
			// isJsonp: false,								// 是否 为jsonp 默认为false	

			staticData: selectData, 						// table 静态数据，当ajaxUrl同时存在时候，优先异步数据

			// isLocalSort: false, 							// 是否本地排序，默认本地排序 --  另外，开启排序列请在下面columns里配置sortable, 以及指定dataType 排序数据类型

			checkable: true,								// 是否 开启 复选框 checkbox ---- 默认 false 不显示 ，注意 次配置不开启则 isShowCheckboxText 显示文字无效
			isShowCheckboxText: true, 						// 是否 显示 checkbox 序号 和 表头 全选文字， 默认 false 不显示
				
			pageSize:6, 									// 分页大小  默认10条/页
															// 关于分页： 异步 默认 后端 分页数据，若为静态数据 则自动 前端 本地分页 
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
    })



## API说明
