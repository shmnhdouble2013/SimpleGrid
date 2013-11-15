/**
 * 分页组件，继承自KISSY.gallery.pagination
 * 支持KISSY1.3.0
 */
KISSY.add(function(S, Core, KP, template){
	var DOM = S.DOM,
		Event = S.Event;
	/**
	* 分页组件
	* @class Pagination
	* @module Pagination 
	* @author 元晃
	* @extend KISSY.gallery.pagination
	* @constructor Pagination
	* @param {Object} config 配置项 请参照KISSY.gallery.pagination的配置项
	*/
	function Pagination(config){
		var _self = this;
		S.mix(Pagination.config, config, true, null, true);
		Pagination.superclass.constructor.call(_self, Pagination.config);
		//支持的事件
		_self.events = [
			/**
			* 切换页码前触发的事件，如果返回false,则不触发翻页
			* @event beforePageChange
			* @param {event} e 事件对象
			* @param {Number} e.idx 页码
			*/
			'beforePageChange',
			/**
			* 切换页码后触发的事件
			* @event afterPageChange
			* @param {event} e 事件对象
			* @param {Number} e.idx 页码
			*/
			'afterPageChange'
		];
	}
	S.extend(Pagination, KP);
	Pagination.config = {
        /**
         * 分页的 DOM 容器
		 * @property container
         * @type String|HTMLElement|KISSY.Node
         */
        /**
         * 当前页序号
         * @property currentPage
         * @type Number
         * @default 1
         */
        /**
         * 显示多少页
         * - 当为0时, 表示只显示上一页/下一页
         * - ... prev1 prev2 current next1 next2 ...
         * @property displayPageCount
         * @type Number
         * @default 2
         */
        /**
         * 总是显示前x页或后x页.
         * @property alwaysDisplayCount
         * @type Number
         * @default 1
         */
        /**
         * 总共多少页, 当不设值该值时, 不能计算页码, 只能显示上一页和下一页
         * @property totalPage
         * @type Number
         * @default 0
         */
        /**
         * 首页序号, 首页序号从哪边开始计
         * @property firstPage
         * @type Number
         * @default 1
         */
        /**
         * 末页序号
         * @private
         * @property endPage
         * @type Number
         * @default 0
         */
        /**
         * 是否有下一页, 供那些不明确页数情况下使用, 需要后台接口给出
         * @property hasNext
         * @type Boolean
         * @default true
         */
        /**
         * 是否初始加载第一页
         * @property loadCurrentPage
         * @type Boolean
         * @default true
         */
        /**
         * 钩子标志, 点击元素上如果有该标志, 需要跳转到特定页
         * @property pageRedirectHook
         * @type String
         * @default 'data-page'
         */
        /**
         * 分页器加载数据状态标志
         * @property isLoading
         * @type Boolean
         * @default false
         * @private
         */
		/**
		* 是否显示省略号
		* @property ellipseText
		* @type Boolean
		* @default true
		*/
		ellipseText: true,
		/**
		* 模板
		* @property template
		* @type String
		* @default back_middle
		*/
		template: template,
        /**
         * 点击分页项时, 调用的函数
         * @property callback
         * @type Function
         * 带三个参数:
         *  - idx: 新页号
         *  - pg obj: 当前分页对象
         *  - ready: fn 供外部调用者, 当切换好页时, 更新分页HTML等后续操作
         */
		callback: function (idx, pg, ready) {
			ready(idx);
			return false;
		},
        /**
         * 定制事件支持
         * @property events
         * @type Object  such as:
         * {
         *     'J_className1': {
         *         click: function(e) {
         *              // do sth
         *         }
         *     }
         *     'J_className2': {
         *         click: "page"
         *     }
         * }
         */	
		events: {
			'J_MuiModuleJumpto': {
				"click":function(e){
					e.preventDefault();
					var con = this.get('container'),
						ipt,
						page,
						total;
					if(con){
						ipt = con.one('.J_MuiModulePageIpt');
						total = this.get("totalPage");
						page = parseInt(DOM.val(ipt));
						if(page > total){
							page = total
						}
						this.page(page);
					}
				}
			}
		}
	};
	
	S.augment(Pagination, {
		/**
		* 设置当前页
		* @method setCurrentPage
		* @param {Number} page 目标页码
		*/
		setCurrentPage: function(page){
			var _self = this,
				beforeCurrentPage = _self.get("currentPage");
			page =  parseInt(page);
			if(beforeCurrentPage !== page){
				_self.set("currentPage", page);
				_self.update();
			}
		},
		/**
		* 从url中获取当前页码，并设置到控件中 - 用于后台同步请求，前端动态渲染分页
		* @method setCurrentPageSync
		* @param {String} [key] 页码的key，默认：page
		*/
		setCurrentPageSync: function(key){
			var _self = this,
				page = Pagination.getUrlPage(key);
			_self.setCurrentPage(page);
			return page;
		},
		/**
		* 设置总页数
		* @method setTotalPage
		* @param {Number} page 目标总页数
		*/
		setTotalPage: function(page){
			var _self = this,
				beforeTotalPage = _self.get("totalPage");
			page =  parseInt(page);
			if(beforeTotalPage !== page){
				_self.set("totalPage", page);
				_self.update();
			}
		}
	});
	
	S.mix(Pagination, {
	
		/**
		* 从url中获取当前页码 - 用于后台同步请求，前端动态渲染分页
		* @method getUrlPage
		* @static
		* @param {String} [key] 页码的key，默认：page
		*/
		getUrlPage: function(key){
			var _self = this,
				page;
			key = key || 'page';
			page = S.unparam(window.location.search.substring(1))[key] || 1;
			return parseInt(page);
		},
		/**
		* 通过改变url，跳到另一个页面，用于后台同步分页的页面跳转
		* @method goToPage
		* @static
		* @param {Number} page 目标页数
		* @param {String} [key] 页码的key，默认：page
		*/
		goToPage: function(page, key){
			key = key || 'page';
			page =  parseInt(page);
			var url = window.location.href,
				anchor = '',
				anchorIndex = url.indexOf('#'),
				keyReg = new RegExp(key + '=\\-?\\d+&*', 'ig'),
				urlPage = Pagination.getUrlPage(key);
			
			if(page === urlPage){
				return false;
			}
							
			// 支持锚点
			if (anchorIndex > -1) {
				anchor = url.substring(anchorIndex);
				url = url.substring(0, anchorIndex);
			}
			if (url.indexOf('?') === -1) {
				url += '?';
			}else{
				if(url.slice(-1) !== "?" && url.slice(-1) !== "&"){
					url += '&';
				}
			}
			// 去掉之前的key
			url = url.replace(keyReg, '');
			url = [url, key, '=', page, anchor].join('');
			// 页面跳转
			window.location.href = url;
		}
		
	});
	
	return Pagination;
},{requires:['core', './paginationBase', './themes/back_middle', './css/back.css', './css/btn.css']});
