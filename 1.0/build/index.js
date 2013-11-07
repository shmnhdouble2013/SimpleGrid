/*
combined files : 

gallery/SimpleGrid/1.0/plugin/pagination/template
gallery/SimpleGrid/1.0/plugin/pagination/paginationBase
gallery/SimpleGrid/1.0/plugin/pagination/themes/back_middle
gallery/SimpleGrid/1.0/plugin/pagination/pagination
gallery/SimpleGrid/1.0/index

*/
/**
 * @fileOverview KISSY Template Engine
 * @author yyfrankyy@gmail.com
 */
KISSY.add('gallery/SimpleGrid/1.0/plugin/pagination/template',function (S) {

    var // Template Cache
        templateCache = {},

    // start/end tag mark
        tagStartEnd = {
            '#': 'start',
            '@': 'start',
            '/': 'end'
        },

    // static string
        KS_TEMPL_STAT_PARAM = 'KS_TEMPL_STAT_PARAM',
        KS_TEMPL_STAT_PARAM_REG = new RegExp(KS_TEMPL_STAT_PARAM, "g"),
        KS_TEMPL = 'KS_TEMPL',
        KS_DATA = 'KS_DATA_',
        KS_AS = 'as',

    // note : double quote for generated code
        PREFIX = '");',
        SUFFIX = KS_TEMPL + '.push("',

        PARSER_SYNTAX_ERROR = 'KISSY.Template: Syntax Error. ',
        PARSER_RENDER_ERROR = 'KISSY.Template: Render Error. ',

        PARSER_PREFIX = 'var ' + KS_TEMPL + '=[],' +
            KS_TEMPL_STAT_PARAM + '=false;with(',

        PARSER_MIDDLE = '||{}){try{' + KS_TEMPL + '.push("',

        PARSER_SUFFIX = '");}catch(e){' + KS_TEMPL + '=["' +
            PARSER_RENDER_ERROR + '" + e.message]}};return ' +
            KS_TEMPL + '.join("");',

    // restore double quote in logic template variable
        restoreQuote = function (str) {
            return str.replace(/\\"/g, '"');
        },

    // escape double quote in template
        escapeQuote = function (str) {
            return str.replace(/"/g, '\\"');
        },

        trim = S.trim,

    // build a static parser
        buildParser = function (tpl) {
            var _parser,
                _empty_index;
            return escapeQuote(trim(tpl)
                .replace(/[\r\t\n]/g, ' ')
                // escape escape ... . in case \ is consumed when run tpl parser function
                // '{{y}}\\x{{/y}}' =>tmpl.push('\x'); => tmpl.push('\\x');
                .replace(/\\/g, '\\\\'))
                .replace(/\{\{([#/@]?)(?!\}\})([^}]*)\}\}/g,
                function (all, expr, body) {
                    _parser = "";
                    // must restore quote , if str is used as code directly
                    body = restoreQuote(trim(body));
                    // is an expression
                    if (expr) {
                        _empty_index = body.indexOf(' ');
                        body = _empty_index === -1 ?
                            [ body, '' ] :
                            [
                                body.substring(0, _empty_index),
                                body.substring(_empty_index)
                            ];

                        var operator = body[0],
                            fn,
                            args = trim(body[1]),
                            opStatement = Statements[operator];

                        if (opStatement && tagStartEnd[expr]) {
                            // get expression definition function/string
                            fn = opStatement[tagStartEnd[expr]];
                            _parser = String(S.isFunction(fn) ?
                                fn.apply(this, args.split(/\s+/)) :
                                fn.replace(KS_TEMPL_STAT_PARAM_REG, args));
                        }
                    }
                    // return array directly
                    else {
                        _parser = KS_TEMPL +
                            '.push(' +
                            // prevent variable undefined error when look up in with, simple variable substitution
                            // with({}){alert(x);} => ReferenceError: x is not defined
                            'typeof (' + body + ') ==="undefined"?"":' + body +
                            ');';
                    }
                    return PREFIX + _parser + SUFFIX;

                });
        },

    // expression
        Statements = {
            'if': {
                start: 'if(typeof (' + KS_TEMPL_STAT_PARAM + ') !=="undefined" && ' + KS_TEMPL_STAT_PARAM + '){',
                end: '}'
            },

            'else': {
                start: '}else{'
            },

            'elseif': {
                start: '}else if(' + KS_TEMPL_STAT_PARAM + '){'
            },

            // KISSY.each function wrap
            'each': {
                start: function (obj, as, v, k) {
                    var _ks_value = '_ks_value',
                        _ks_index = '_ks_index';
                    if (as === KS_AS && v) {
                        _ks_value = v || _ks_value;
                        _ks_index = k || _ks_index;
                    }
                    return 'KISSY.each(' + obj +
                        ', function(' + _ks_value +
                        ', ' + _ks_index + '){';
                },
                end: '});'
            },

            // comments
            '!': {
                start: '/*' + KS_TEMPL_STAT_PARAM + '*/'
            }
        };

    /**
     * Template
     * @param {String} tpl template to be rendered.
     * @return {Object} return this for chain.
     */
    function Template(tpl) {
        if (!(templateCache[tpl])) {
            var _ks_data = S.guid(KS_DATA),
                func,
                o,
                _parser = [
                    PARSER_PREFIX,
                    _ks_data,
                    PARSER_MIDDLE,
                    o = buildParser(tpl),
                    PARSER_SUFFIX
                ];

            try {
                func = new Function(_ks_data, _parser.join(""));
            } catch (e) {
                _parser[3] = PREFIX + SUFFIX +
                    PARSER_SYNTAX_ERROR + ',' +
                    e.message + PREFIX + SUFFIX;
                func = new Function(_ks_data, _parser.join(""));
            }

            templateCache[tpl] = {
                name: _ks_data,
                o: o,
                parser: _parser.join(""),
                render: func
            };
        }
        return templateCache[tpl];
    }

    S.mix(Template, {
        /**
         * Logging Compiled Template Codes
         * @param {String} tpl template string.
         */
        log: function (tpl) {
            if (tpl in templateCache) {
                //     if ('js_beautify' in window) {
//                        S.log(js_beautify(templateCache[tpl].parser, {
//                            indent_size: 4,
//                            indent_char: ' ',
//                            preserve_newlines: true,
//                            braces_on_own_line: false,
//                            keep_array_indentation: false,
//                            space_after_anon_function: true
//                        }), 'info');
                // } else {
                S.log(templateCache[tpl].parser, 'info');
                // }
            } else {
                Template(tpl);
                this.log(tpl);
            }
        },

        /**
         * add statement for extending template tags
         * @param {String} statement tag name.
         * @param {String} o extent tag object.
         */
        addStatement: function (statement, o) {
            if (typeof statement == 'string') {
                Statements[statement] = o;
            } else {
                S.mix(Statements, statement);
            }
        }

    });

    S.Template = Template;

    return Template;

});
/**
 * TODO: check spec
 *  - http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html
 *
 * 2012-04-24 yiminghe@gmail.com
 *      - support {{@if test}}t{{/if}} to prevent collision with velocity template engine
 *
 *
 * 2011-09-20 note by yiminghe :
 *      - code style change
 *      - remove reg cache , ugly to see
 *      - fix escape by escape
 *      - expect(T('{{#if a=="a"}}{{b}}\\"{{/if}}').render({a:"a",b:"b"})).toBe('b\\"');
 */

/**
 * @fileoverview Pagination
 * @desc 分页组件
 * @author 乔花<shengyan1985@gmail.com>
 * @date 20110918
 * @version 1.0
 * @depends kissy, template
 */
KISSY.add('gallery/SimpleGrid/1.0/plugin/pagination/paginationBase',function(S, Template, undefined) {
    var EVENT_PAGE_BEFORE = 'beforePageChange',
        EVENT_PAGE_AFTER = 'afterPageChange',  // 其实是和 afterCurrentPageChange 等价的
        ENTER = 13,

        DEFAULT_TPL = '';

    // 添加for语句
    Template.addStatement('for', {
        start: 'for(KS_TEMPL_STAT_PARAM){',
        end: '}'
    });
    /**
	 * 构造器
	 * @param {Object} cfg 配置参数
	 * @return
	 */
    function Pagination(cfg) {
        Pagination.superclass.constructor.apply(this, arguments);
        this._init();
    }
	
	//配置项
    Pagination.ATTRS = {
        /**
         * 分页的 DOM 容器
         * @type String|HTMLElement|KISSY.Node
         */
        container: {
            setter: function(v) {
                if (S.isString(v)) {
                    return S.one(v);
                }
                if (v.offset) return v;
                return new S.Node(v);
            }
        },
        /**
         * 点击分页项时, 调用的函数
         * @type Function
         * 带三个参数:
         *  - idx: 新页号
         *  - pg obj: 当前分页对象
         *  - ready: fn 供外部调用者, 当切换好页时, 更新分页HTML等后续操作
         */
        callback: {
            value: function(idx, pg, ready) {
                ready(idx);
            }
        },
        /**
         * 当前页序号
         * @type Number
         */
        currentPage: {
            value: 1,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 点击页号时, url 变化, 暂时不实现
         */
        linkTo: {
            value: '#'
        },
        /**
         * 显示多少页.
         * - 当为0时, 表示只显示上一页/下一页
         * - ... prev1 prev2 current next1 next2 ...
         * @type Number
         */
        displayPageCount: {
            value: 2,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 总是显示前x页或后x页.
         * @type Number
         */
        alwaysDisplayCount: {
            value: 1,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 总共多少页, 当不设值该值时, 不能计算页码, 只能显示上一页和下一页
         * @type Number
         */
        totalPage: {
            value: 0,
            setter: function(v) {
                if (v) this.set('endPage', v + this.get('firstPage') - 1);
            }
        },
        /**
         * 首页序号, 首页序号从哪边开始计
         * @type Number
         */
        firstPage: {
            value: 1,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 末页序号
         * @private
         * @type Number
         */
        endPage: {
            value: 0
        },
        /**
         * 是否有下一页, 供那些不明确页数情况下使用, 需要后台接口给出
         * @type Boolean
         */
        hasNext: {
            value: true
        },
        /**
         * 是否省略多页
         * @type Boolean
         */
        ellipseText: {
            value: true
        },
        /**
         * 是否初始加载第一页
         * @type Boolean
         */
        loadCurrentPage: {
            value: true
        },
        /**
         * 分页模板
         * @type String
         */
        template: {
            value: DEFAULT_TPL
        },
        /**
         * 钩子标志, 点击元素上如果有该标志, 需要跳转到特定页
         * @type String
         */
        pageRedirectHook: {
            value: 'data-page'
        },
        /**
         * 分页器加载数据状态标志
         * @type Boolean
         * @private
         */
        isLoading: {
            value: false
        },
        /**
         * 定制事件支持
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
            value: {}
        }
    };
    S.extend(Pagination, S.Base, {
        _init: function() {
            var self = this;

            // 载入第一页
            if (self.get('loadCurrentPage')) {
                self.page(self.get('currentPage'));
            } else {
                self.update();
            }
            self._bind();
        },
        /**
         * 根据当前状态, 构建HTML
         */
        update: function() {
            var self = this,
                currentPage = self.get('currentPage'),
                // 最多显示多少个页数
                displayPageCount = self.get('displayPageCount'),
                // 起始页/末页序号
                firstPage = self.get('firstPage'), endPage = self.get('endPage'),
                // 前后总是显示多少页
                alwaysDisplayCount = self.get('alwaysDisplayCount'),
                // 起始页码
                startIndex, endIndex,
                // 是否要缩略显示页码
                ellipseText = self.get('ellipseText');

            // 需要显示省略号时, 需要确定显示页码区间
            if (endPage && ellipseText) {
                startIndex = Math.min(Math.max(firstPage, parseInt(currentPage - displayPageCount)), endPage - displayPageCount * 2);
                endIndex = Math.min(endPage, startIndex + displayPageCount * 2);
            }
            // 否则就是全部显示页码, 且此时 alwaysDisplayCount 无效,
            // displayPageCount 只取 0 或非 0. falsy 不显示页码, truth 显示页码
            else if (endPage) {
                startIndex = firstPage;
                endIndex = endPage;
            }

            S.log([currentPage, ellipseText, firstPage, endPage, alwaysDisplayCount, !!displayPageCount, Math.max(startIndex, firstPage), Math.min(endIndex, endPage), self.get('hasNext')]);
            self.get('container').html(Template(self.get('template')).render({
                currentPage: currentPage,
                ellipseText: ellipseText,
                startPage: firstPage,
                endPage: endPage,
                alwaysDisplayCount: alwaysDisplayCount,
                showPageNum: !!displayPageCount,
                startIndex: Math.max(startIndex, firstPage),
                endIndex: Math.min(endIndex, endPage),
                hasNext: self.get('hasNext')
            }));

            self.fire(EVENT_PAGE_AFTER, {idx: currentPage});
        },
        /**
         * 绑定点击事件, 做页面切换
         */
        _bind: function() {
            var self = this,
                container = self.get('container'),
                pageTo = function(e) {
                    var target = new S.Node(e.target),
                        hook = parseInt(target.attr(self.get('pageRedirectHook')));
                    if (isNaN(hook)) return;

                    e.preventDefault();
                    if (self.get('isLoading')) return;

                    self.page(hook);
                };

            container.on('click', pageTo)/*.on('keyup', function(e) {
                if (e.keyCode === ENTER) {
                    pageTo(e);
                }
            })*/;


            // 用户定制事件
            var eventsCfg = self.get('events'),
                eventsList = [];
            // 依次找到所有事件类型
            S.each(eventsCfg, function(eventsObj) {
                S.each(eventsObj, function(fn, events) {
                    eventsList.push(events);
                });
            });
            S.each(eventsList, function(events) {
                // 仿事件代理
                container.on(events, function(e) {
                    var target = new S.Node(e.target),
                        runList = [];
                    while(target && target[0] !== container[0]) {
                        // 触发特定钩子上的特定事件
                        S.each(eventsCfg, function(eventsObj, cls) {
                            if (target.hasClass(cls)) {
                                S.isFunction(eventsObj[events]) && runList.push(eventsObj[events]);
                            }
                        });
                        // 往上遍历, 有时 target 会被删除掉
                        target = target.parent();
                    }

                    // 依次执行
                    S.each(runList, function(fn) {
                        fn.call(self, e);
                    });
                });
            });
        },
        /**
         * 跳转到第几页
         * @param idx
         */
        page: function(idx) {
            idx = parseInt(idx);
            if (isNaN(idx)) return;

            var self = this,
                endPage = self.get('endPage');

            if (self.fire(EVENT_PAGE_BEFORE, {idx: idx}) === false) return;

            // 防止重复切换
            self.set('isLoading', true);

            // 分页器切换到特定页时的状态
            self.set('currentPage', idx);

            // 完整性考虑, 当能取到 endPage 时, 也去更新下 hasNext 值
            // 当没法取到 endPage 时, 只能依赖后台或外部设定 hasNext 值后才能更新分页器, 代码即 ready 中的 代码
            if (endPage)  {
                self.set('hasNext', idx < endPage);
                self.update();
            }

            // 加载完某页后续工作
            function ready() {
                if (!endPage) {
                    self.update();
                }
                self.set('isLoading', false);
            }
            var cb = self.get('callback');
            S.isFunction(cb) && cb(idx, self, ready);
        },
        destroy: function() {
            var self = this;
            // 删除所有事件!!
            self.get('container').detach();
            self.get('container').remove();
        }
    });

    return Pagination;
}, {
    requires: ["./template"]
});
/**
 * - 抽离分页HTML模板, 更加定制 --- 20111108 Done;
 * - 起始页/最终页 --- 20111109 Done;
 * - 跳转页框 --- 20111110 Done;
 * - aria/tabindex --- 参考了现有组件, 貌似没有都没有考虑, 暂时去掉 tabElem[0].focus()
 */
KISSY.add('gallery/SimpleGrid/1.0/plugin/pagination/themes/back_middle',function(S){
  var template = [
   	'{{#if ((endPage - startPage)>0) }}',
	    '<div class="mui-page-m">',
			'<div class="mui-page-wrap">',
				'<div class="mui-page-num">',
					// 显示上一页
					'{{#if currentPage === startPage }}',
						'<b class="mui-page-prev">&lt;</b>',
					'{{#else}}',
						'<a class="mui-page-prev" href="#" data-page="{{ currentPage - 1 }}">&lt;</a>',
					'{{/if}}',
					// 左边固定显示几页, 如固定显示 1 和 2
					'{{#if showPageNum }}',
						'{{#if currentPage > startPage + alwaysDisplayCount - 1}}',
							'{{#for var i = 0; i < alwaysDisplayCount; i++ }}',
								// 避免后面重复显示
								'{{#if i + startPage < startIndex }}',
									'<a href="#" data-page="{{ i + startPage}}">{{ i + startPage }}</a>',
								'{{/if}}',
							'{{/for}}',
						'{{/if}}',
						// 是否显示省略号
						'{{#if ellipseText && startIndex > startPage + alwaysDisplayCount }}',
							'<b class="mui-page-break">...</b>',
						'{{/if}}',
						// 显示页数
						'{{#for var i = startIndex; i <= endIndex; i++ }}',
							'{{#if currentPage !== i }}',
								'<a href="#" data-page="{{ i }}">{{ i }}</a>',
							'{{#else}}',
								'<b class="mui-page-cur">{{ i }}</b>',
							'{{/if}}',
						'{{/for}}',
						// 是否显示省略号
						'{{#if ellipseText && endIndex < endPage - alwaysDisplayCount }}',
							'<b class="mui-page-break">...</b>',
						'{{/if}}',
					'{{/if}}',
					// 显示下一页
					'{{#if currentPage === endPage }}',
						'<b class="mui-page-next">&gt;</b>',
					'{{#else}}',
						'<a href="#" class="mui-page-next" data-page="{{ currentPage + 1 }}">&gt;</a>',
					'{{/if}}',
	  			'</div>',
				'<div class="mui-page-skip">',
					'<form class="J_MuiPageForm" name="" method="get" action="">',
					  	'共{{ endPage-startPage+1 }}页，去第<input type="text" name="page" class="J_MuiModulePageIpt mui-page-skipTo" size="3" value="{{ currentPage }}">页',
					  	'<button type="submit" class="J_MuiModuleJumpto mui-btn-s mui-page-skipBtn">确定</button>',
					'</form>',
				'</div>',
	  		'</div>',
	    '</div>',
    '{{/if}}'].join('');

  	return template;
},{requires:[]});


/**
 * 分页组件，继承自KISSY.gallery.pagination
 * 支持KISSY1.3.0
 */
KISSY.add('gallery/SimpleGrid/1.0/plugin/pagination/pagination',function(S, Core, KP, template){
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
},{requires:['core', './paginationBase', './themes/back_middle', './back.css', './btn.css']});



/** 
* @fileOverview SimpleGrid表格
* @extends  KISSY.Base
* @author   黄甲 <水木年华double>
* @depends  ks-core
* @version  1.0  
* @update   2013-09-30
* @example
*   new SimpleGrid('#poolTable', {
		gridData:[{},{}],				// 静态数据
		columns: [						// 列配置
            {title: 'id', width: '150px', sortable: true, dataType: 'float', dataIndex: 'id'},
            {title: '活动类型',width: 'auto', sortable: true, dataType: 'string', dataIndex: 'actype'}
        ]    
	});

	* 	ajaxUrl 返回数据格式
	*	{ 	
	*		"success":true,
	*		"message":"",
	*		"rows":[], 
	*		"results":0 
	*	}	
*/

KISSY.add('gallery/SimpleGrid/1.0/index', function(S, XTemplate, Store, Pagination, TL) { 
	var DOM = S.DOM,
		Node = S.Node,
		Ajax = S.IO,
		UA = S.UA,
		Event = S.Event,
		S_Date = S.Date,
        win = window,
        doc = document;		

	// 设定全局 参数 常量 
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

		CLS_HIDDEN = 'cls-hide', 					// 是否隐藏 列 隐藏钩子 

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

			dataField:'id',							// 单条 josn 数据 标示

			isOuterTpl: false						// 是否外部自定义 tr 模板
		};
	
	
	 /**
     * 
     * @class SimpleGrid
     * @constructor
     * @extends Base
     */
	function SimpleGrid(container, config){
		var _self = this,
			config = S.merge(POLLGRIDDEFAULT, config);

		if(!container){
			throw 'please assign the id of rendered Dom, of the container of this grid!';
			return;
		}	

		_self.container = S.get(container) ? S.get(container) : S.get('#'+container);
		

		if( !(_self instanceof SimpleGrid) ){
			return new SimpleGrid(container, config);
		}

		SimpleGrid.superclass.constructor.call(_self, config);		

		_self._init();
	}


	// 支持的事件
	SimpleGrid.events = [
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

	SimpleGrid.VERSION = 1.0;

	// 继承于KISSY.Base  
	S.extend(SimpleGrid, S.Base);	
	S.augment(SimpleGrid, {

		// 控件 初始化
		_init: function(){
			var _self = this;

			_self._initStore();	
			_self._initGrid();
			_self._eventRender();
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

			// ie 下 移除 a标签 和 input 默认虚线框		
			Event.delegate(_self.thead, 'click', 'a', function(ev){
				_self._forIeline(ev);
			});
			Event.delegate(_self.tbodyContainer, 'click', 'input', function(ev){
				_self._forIeline(ev);
			});
		},

		// ie失焦 去掉虚线
		_forIeline: function(ev){
			var _self = this;

			if(!ev){
				return;
			}

			var tag = ev.target;
			tag.blur();
		},

		// 纵向滚动条 处理
		_topScrollFn: function(){
			var _self = this;

			_self.lastTh = S.Node(_self.thead).first().last('th'); 
			_self.lastThWidth = _self.lastTh.width();

			setInterval(function(){
				_self._scrollRender();
			}, 200);
		},

		// 修正 滚动条值
		_scrollRender: function(){
			var _self = this,	
				correctPx = 13,	
				afterCorrectWidth,	
				curLastThWidth = _self.lastTh.width(),					
				hasScrollTop = _self.isScrollTop(_self.tbodyContainer);

			// ie 6-7 则不修正	
			if(UA.trident && UA.ie <= 7){
				return;
			}

			// // safari 修正值
			// if(UA.safari){
			// 	correctPx = 28;
			// }
			afterCorrectWidth = _self.lastThWidth + correctPx;
			
			// 修正值 避重判断		
			if( hasScrollTop && (curLastThWidth === afterCorrectWidth) || !hasScrollTop && (curLastThWidth === _self.lastThWidth) ){
				return;
			}

			// 写入修正值
			if(hasScrollTop){
				DOM.css(_self.lastTh, "width", afterCorrectWidth + 'px');
			}else{
				DOM.css(_self.lastTh, "width", _self.lastThWidth + 'px');				
			}	
		},

		// 是否出现 纵向 滚动条
		isScrollTop: function(docRange){
			var _self = this,
				isCrollTop = false,
				docRange = docRange ? docRange : null;

			docRange = S.get(docRange);
				
			if(!docRange){
				return;
			}

			var containerHeight = DOM.height(docRange),
				containerWeight = DOM.width(docRange),
				scrollLeft = DOM.scrollLeft(docRange),
				scrollTop = DOM.scrollTop(docRange),
				scrollHeight = docRange.scrollHeight,
				scrollWidth = docRange.scrollWidth;

			if(containerHeight < scrollHeight &&　scrollTop >=0){
				isCrollTop = true;
			}	

			return isCrollTop;
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

			var isAllRowsSelected = _self._isAllRowsSelected(),
				selectAry = _self.getSelection();	
				
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

			// 回显 排序前 数据全选
			if(isAllRowsSelected){
				_self._setAllRowsSelected(true);
			}else{
				_self._setHeaderChecked(false);
				_self._setDataSelect(selectAry, true);
			}
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

			// 纵向滚动条
			_self._topScrollFn();
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
				width = parseInt( _self.setPxCheck(width), 10);
				
			if(width ){ // && width >= outerWidth
				DOM.css(_self.table, 'width', width+'px' );
			}
		},

		// 设置Grid Body的高度
		setHeight: function(height){
			var _self = this,
				tbodyContainer = S.get('.tbody-container', _self.container), 
				theadHeight = DOM.outerHeight(_self.thead), 
				tfootHeight = DOM.outerHeight(_self.tfoot), 
				parseHeight = parseInt( _self.setPxCheck(height), 10),
				tbodyHeight = parseHeight-(theadHeight + tfootHeight + 7);

			if(tbodyHeight>0){ //  && height >= outerHeight
				DOM.css(tbodyContainer, 'height', tbodyHeight+'px' );
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

			// 数字值: 500 || 字符串值: 'auto' || '500px'
			if(S.isNumber(px)){
				endVaue = px+'px';
			}else if(S.isString(px)){
				var isPercentage = px.split('%'),
					hasPx = px.split('px');

				// 如果等于auto
				if(px === endVaue){
					return endVaue;
				}	

				// 百分比宽度
				if(isPercentage.length>1){
					console.log('The percentage of CSS values is not supported!'); 
					return;
				}	
				// 字符串像素值
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
		* 取消 当前页面 所有 选中 状态 
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
			
			if(!checkEl) {
				return 'checkbox Element is undefined!';
			}
			
			checkEl.attr('checked', checked);
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

		// 根据 传入data --- 设定表格中的 对应的row选中状态
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

return SimpleGrid;

}, {'requires':['xtemplate', './store', './plugin/pagination/pagination', './uicommon', 'sizzle', './grid.css']}); 

/**
* 已知问题：
* safari 纵向滚动条 导致的 th标题 与 td内容 对齐 存在 15左右像素偏差 
* 点击排序 后 单选 回显 问题 
* 当动态隐藏 某列 时候 存在 th td 对齐偏差，建议第一次就渲染好列，不要动态改动
* 
**/


