/**
* 数据缓冲类，缓存数据在浏览器中
* @class 数据缓冲类
* @param {Object} config 配置项，store上面的field字段可以传入配置项中
* @property {String} url 是字段 proxy.url的简写方式，可以直接写在配置信息中
* @example 
* var store = new Store({
*	url : 'data.php'
	root: 'rows',  // 根目录
	totalProperty: 'results',  // 数据条数
	proxy: {url : 'data.php', method: 'get' } //按照'name' 字段降序排序
	params: {id:'124', type:1}//自定义参数
	
	matchFunction  // 对象匹配函数	
	
*	resultRows : [],
*	newRecords : [],
*	modifiedRecords : [],
*	deletedRecords : [],
*	rowCount : 0,
*	totalCount : 0
*});
*/

KISSY.add('gallery/tmSimpleGrid/1.0/store', function(S){
	var DOM = S.DOM, 
		Event = S.Event,
        win = window, 
        UA = S.UA;

	function Store(config){
		var _self = this;

		config = config || {};

		config = S.merge(
		/** @lends Store.prototype */	
		{
			/**
			* 加载数据时，返回数据的根目录
			* @field
			* @type String
			* @default  "rows"
			* @example 
			* '{"rows":[{"name":"abc"},{"name":"bcd"}],"results":100}'
			*/
			root: 'rows', 

			/**
			* 加载数据时，符合条件的数据总数，用于 前端 分页
			* @field
			* @type String
			* @default  "results"
			* @example
			*
			* '{"rows":[{"name":"abc"},{"name":"bcd"}],"results":100}'
			*/
			totalProperty: 'results', 

			/**
			* 排序信息 
			* @field 2个字段 -- 排序字段、排序方向
			* @type Object
			* @default { field: '', direction: 'ASC' }
			* @example 
			* var store = new Store({
			*		url : 'data.php',
			*		sortInfo: { field: 'name', direction: 'DESC' }//按照'name' 字段降序排序
			*	});
			*/
			sortInfo: { field: '', direction: 'ASC', dataType:'string'},

			/**
			* ajax config 包含3个字段:
			* url : 数据的url
			* method : 数据的方式"get","post"，默认值为"post"
			* dataType: 数据返回的格式,目前只支持"json、jsonp"格式(此种情况下 强制 method为 get方式  )
			* @field 
			* @type Object
			* @default { method: 'post', dataType: 'json', url:null }
			* @example 
			* var store = new Store({
			*		url : 'data.php',
			*		method: 'get',
			*		dataType: 'json'
			*	});
			*/			
			proxy: { url:null, method: 'post', dataType: 'json' },

			/**
			* 自定义参数，用于加载数据时发送到后台
			* @field
			* @type Object
			* @example
			* var store = new Store({
			*		url :'data',
			*		params: {id:'124',type:1}//自定义参数
			*	});
			*/
			params:{},

			/**
			* 是否后端排序，如果为后端排序，每次排序发送新请求，否则，直接前端排序 -- 默认 前端排序
			* @field 
			* @type Boolean
			* @default true
			*/
			localSort: true,

			/**
			* josn 数据 - 根据 指定字段 验证2条数据是否相同
			* @ field string
			* @ default 'id'
			*/
			dataField: 'id', 

			/**
			* 分页信息 pageInfo {currentPage:'当前页', limit:'分页大小', totalPage:'总页数'' }
			* @param {string} 
			* @return {}
			*/
			pageInfo: {currentPage: 1, limit: 10, totalPage: 3},
			
			/**
			* 是否后端分页数据，如果是则每次 分页 发送新请求，否则，直接前端分页 -- 默认后端分页
			* @field 
			* @type Boolean
			* @default true
			*/
			localPagination: false,


			/**
			* 是否有分页-- 默认有
			* @field 
			* @type Boolean
			* @default true
			*/
			isPagination: true 

		}, config);

		S.mix(_self, config);
		S.mix(_self, {
			resultRows : [],
			newRecords : [],
			modifiedRecords : [],
			deletedRecords : [],
			disableRecords : [],
			rowCount : 0,
			totalCount : 0,
			totalData : [] // result数据暂存
		});

		//声明支持的事件
		_self.events = [
			/**  
			* 数据接受改变，所有增加、删除、修改的数据记录清空
			* @name Store#acceptchanges
			* @event  
			*/
			'acceptchanges',


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
			* 当删除数据是触发该事件
			* @name Store#removerecords  
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 删除的数据集合
			*/
			'removerecords',
			
			/**  
			* 当更新数据指定字段时触发该事件
			* @name Store#updaterecord  
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.record 更新的数据
			* @param {Object} e.field 更新的字段
			* @param {Object} e.value 更新的值
			*/
			'updaterecord',

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
			'totalPageChange',

			/**  
			* currentPageChanged
			* @name Store#currentPageChanged  
			* @event  
			* @param {event} e  事件对象
			* @return {number} 返回当前页面
			*/
			'currentPageChanged'			  
		];

		_self._init();
	}


	S.augment(Store, S.EventTarget);
	S.augment(Store, 
	/** @lends Store.prototype */	
	{
		/**
		* 接受数据改变，将缓存的修改、新增、删除、禁用的集合清除
		*/
		acceptChanges : function(){
			var _self = this;

			_self._clearChanges();
			_self.fire('acceptchanges');
		},
		
		/**
		* 添加记录
		* @param {Array|Object} data 添加的数据，可以是数组，可以是单条记录
		* @param {Boolean} [noRepeat = false] 是否去重,可以为空，默认： false 
		* @param {Function} [match] 匹配函数，可以为空，默认是：<br>
		*  function(obj1,obj2){
		*	 return obj1 == obj2;
		*  }
		*  use
		*/
		add: function(data, noRepeat, match){
			var _self=this,
				newData=[];

			match = S.isFunction(match) ? match : _self._getDefaultMatch();

			if(!S.isArray(data)){
				data = [data];
			}

			S.each(data, function(element){
				if(!noRepeat || !_self.contains(element, match)){
					_self._addRecord(element);
					newData.push(element);
					// 全局 - 增加 新增 记录
					_self.newRecords.push(element);
					// 全局 - 新添加数据 抹去 在删除记录 - 更改记录 的数据历史 
					_self._removeFrom(element, _self.deletedRecords);
					_self._removeFrom(element, _self.modifiedRecords);
					_self._removeFrom(element, _self.disableRecords);
				}
			});
			_self.fire('addrecords', {data:newData});
		},		

		/**
		* 清除数据,清空所有数据 use
		*/
		clear : function(){ 
			var _self = this;
			_self.setResult([]);
		},

		/**
		* store的比较函数
		* @param {Object} obj1 进行比较的记录1
		* @param {Object} obj2 进行比较的记录2
		* @param {String} [field] 进行排序的字段,默认为 sortInfo.field
		* @param {String} [direction] 进行排序的方向,默认为 sortInfo.direction 包括‘ASC’，‘DESC'
		* @return {Number} 
		* 当 obj1 > obj2 时返回 1
		* 当 obj1 = obj2 时返回 0 
		* 当 obj1 < obj2 时返回 -1
		*/
		compare: function(obj1, obj2, field, direction, dataType){
			var _self = this,
				dir = 1;

			field = field || _self.sortInfo.field;
			direction = direction || _self.sortInfo.direction;
			dataType = dataType || _self.sortInfo.dataType;

			//如果未指定排序字段，或方向，则按照默认顺序
			if(!field || !direction){
				return 1;
			}

			dir = direction === 'ASC' ? 1 : -1;

			return this.compareFunction(obj1[field], obj2[field], dataType) * dir;
		},

		/**
		* 验证是否存在指定记录 -- 数字转换boolean值 中间方法
		* @param {Object} record 指定的记录
		* @param {Function} [match = function(obj1,obj2){return obj1 == obj2}] 默认为比较2个对象是否相同
		* @return {Boolean}
		*/
		contains: function(record, match){
			return this.findIndexBy(record, match) !== -1;
		},

		/**
		* 查找数据所在的索引位置,若不存在返回-1 公用方法 -- 已经存在数据(添加过的) 则返回相应加载数据的index值
		* @param {Object} target 指定的记录
		* @param {Function} [func = function(obj1,obj2){return obj1 == obj2}] 默认为比较2个对象是否相同
		* @return {Number}
		*/
		findIndexBy: function(target, func){
			var _self = this,
				position = -1,
				records = this.resultRows;
				
			func = S.isFunction(func) ? func : _self._getDefaultMatch();
			
			if(S.isUndefined(target) || S.isNull(target)){
				return -1;
			}
			S.each(records, function(record, index){
				if(func.call(_self, target, record)){
					position = index;
					return false;
				}
			});
			return position;
		},

		/**
		* 查找记录，仅返回第一条  use
		* @param {String} field 字段名
		* @param {String|Function} value 字段值 或过滤方法
		* @return {Object|null}
		*/
		find : function(field, value, func){ 
			var result = null,
				records = this.resultRows;
				
			S.each(records, function(record, index){				
				if((func && func.call(this, record[field], value)) || record[field] === value){
					result = record;
					return false;
				}
			});
			return result;
		},

		/**
		* 根据索引查找记录
		* @param {Number} index 索引 use
		* @return {Object} 查找的记录
		*/
		findByIndex : function(index){
			return this.resultRows[index];
		},

		/**
		* 查找记录，返回所有符合查询条件的记录
		* @param {String} field 字段名
		* @param {String|Function} value 字段值 或过滤方法
		* @return {Array}
		*/
		findAll : function(field, value, func){
			var result = [],
				records = this.resultRows;

			S.each(records, function(record, index){
				if((func && func.call(this, record[field], value)) || record[field] === value){
					result.push(record);
				}
			});
			return result;
		},

		/**
		* 获取下一条记录
		* @param {Object} record 当前记录
		* @return {Object} 下一条记录
		*/
		findNextRecord : function(record){
			var _self = this,
				index = _self.findIndexBy(record);

			if(index >= 0){
				return _self.findByIndex(index + 1);
			}
			return undefined;
		},

		/**
		* 加载数据,若不提供参数时，按照上次请求的参数加载数据
		* @param {Object} [params] 自定义参数以对象形式提供
		* @example 
		* store.load({id : 1234, type : 1});
		*/
		load: function (params){
			this._loadData(params);
		},

		/**
		* 获取加载完的数据
		* @return {Array}
		*/
		getResult : function(){
			return this.resultRows;
		},

		/**
		* 获取加载完的数据的数量 use
		* @return {Number}
		*/
		getCount : function () {
            return this.resultRows.length;
        },

		/**
		* 获取添加的数据 use
		* @return {Array} 返回新添加的数据集合
		*/
		getNewRecords : function(){
			return this.newRecords;
		},
		
		/**
		* 获取更改的数据
		* @return {Array} 返回更改的数据集合
		*/
		getModifiedRecords : function(){
			return this.modifiedRecords;
		},

		/**
		* 获取删除的数据
		* @return {Array} 返回删除的数据集合
		*/
		getDeletedRecords : function(){
			return this.deletedRecords;
		},

		/**
		* 获取禁用的数据 use
		* @return {Array}
		*/ 
		getDisableRecords : function(){
			return this.disableRecords;
		},

		/**
		* 获取表格源数据的总数
		* @return {Number}
		*/
        getTotalCount : function () {
            return this.totalCount;
        },

		/**
		* 删除记录触发 removerecords 事件. use
		* @param {Array|Object} data 添加的数据，可以是数组，可以是单条记录
		* @param {Function} [match = function(obj1, obj2){return obj1 == obj2}] 匹配函数，可以为空
		*/
		remove :function(data, match){ 
			var _self =this,
				delData=[];
				
			match = S.isFunction(match) ? match : _self._getDefaultMatch();
			
			if(!S.isArray(data)){
				data = [data];
			}
			S.each(data,function(element){
				var index = _self.findIndexBy(element, match),
				    record = _self._removeAt(index);

				// 添加到已删除队列中, 如果是新添加的数据，不计入删除的数据集合中
				if(!S.inArray(record, _self.newRecords) && !S.inArray(record, _self.deletedRecords)){
					_self.deletedRecords.push(record);
				}
				_self._removeFrom(record,_self.newRecords);
				_self._removeFrom(record,_self.modifiedRecords);
				
				delData.push(record);
			});
			
			_self.fire('removerecords',{data:delData});
		},

		/**
		* 设置数据，在不自动加载数据时，可以手动填充数据，会触发 load事件
		* @param {Array} data 设置的数据集合，是一个数组
		*/
		setResult:function(data){
			var _self = this,			
				data = data || [];
			
			_self.resultRows = data;
			_self.rowCount = data.length;
			_self.totalCount = data.length;

			// 前端分页
			if(_self.isPagination){
				data = _self._localPagination();
			}
			
			_self.fire('load', {loadparams:_self.oldParams, data:data});
		},

		/**
		* 设置记录的值 ，触发 updaterecord 事件
		* @param {Object} obj 修改的记录
		* @param {String} field 修改的字段名
		* @param {Any Type} value 修改的值
		* @param {Boolean} [isMatch = false] 是否需要进行匹配，检测指定的记录是否在集合中
		*/
		setValue : function(obj, field, value, isMatch){
			var record = obj,
				_self = this,
				match = null,
				index = null;

			if(isMatch){
				match =  _self._getDefaultMatch();
				index = _self.findIndexBy(obj,match);
				if(index >=0){
					record = this.resultRows[index];
				}
			}
			record[field]=value;
			if(!S.inArray(record,_self.newRecords) && !S.inArray(record,_self.modifiedRecords)){
					_self.modifiedRecords.push(record);
			}
			_self.fire('updaterecord',{record:record,field:field,value:value});
		},

		/**
		* 排序，根据Store的配置进行，前端排序或发送请求重新加载数据
		* 远程排序，触发load事件，前端排序触发localsort事件
		* @param {String} field 排序字段
		* @param {String} direction 排序方向
		*/
		sort : function(field, direction, dataType){
			var _self = this;

			_self.sortInfo.field = field || _self.sortInfo.field;
			_self.sortInfo.direction = direction || _self.sortInfo.direction;
			_self.sortInfo.dataType = dataType || _self.sortInfo.dataType;
	
			//如果远程排序，重新加载数据
			if(!_self.localSort){	
				this.load();
			}else{
				_self._sortData(field, direction, dataType);
				_self.fire('localsort', _self.sortInfo);
			}
		},

		/**
		* 更新记录 ，触发 updaterecord 事件
		* @param {Object} obj 修改的记录
		* @param {Boolean} [isMatch = false] 是否需要进行匹配，检测指定的记录是否在集合中
		*/
		update : function(obj, isMatch){
			var record = obj,
				_self =this,
				match = null,
				index = null;
			if(isMatch){
				match = _self._getDefaultMatch();
				index = _self.findIndexBy(obj,match);

				if(index >=0){
					record = this.resultRows[index];
				}
			}
			record = S.mix(record,obj);
			if(!S.inArray(record,_self.newRecords) && !S.inArray(record,_self.modifiedRecords)){
				_self.modifiedRecords.push(record);
			}
			_self.fire('updaterecord',{record:record});
		},

		/**
		* 销毁
		*/
        destroy: function () {
			var _self = this;
			_self.detach();
			_self = null;
        },

		// 添加记录  -- 可以指定序号-添加/替换； 增加index数组号
		_addRecord :function(record, index){
			var _self = this,
				records = _self.resultRows;
				
			if(S.isUndefined(index)){
				index = records.length;
			}
			records[index] = record;
			_self.fire('recordadded',{record:record, index:index});
		},

		// 清除改变的数据记录
		_clearChanges : function(){
			var _self = this;
			
			_self.newRecords.splice(0);
			_self.modifiedRecords.splice(0);
			_self.deletedRecords.splice(0);
			_self.disableRecords.splice(0);
		},

		/**
		* 设定 禁用数据 此方法会触发 disableRecords 事件
		* @method setDisableRecords
		* @param {obj || array} 要禁用的数据
		* @return {Object} 禁用的数据
		*/
		setDisableRecords: function(data){
			var _self = this;

			data = S.isArray(data) ? data : [data];

			S.each(data, function(obj, index){
				if( !S.inArray(obj, _self.disableRecords) ){
					_self.disableRecords.push(obj);
				};
			});

			_self.fire('disableRecords', {'data': data});
		},

		/**
		* 解禁数据 此方法会触发 cancelDisableRecords 事件 
		* @method cancelDisableRecords
		* @param {obj || array} 要解禁的数据
		* @return {Object} 解禁的数据
		*/
		cancelDisableRecords: function(data){
			var _self = this;

			data = S.isArray(data) ? data : [data];

			S.each(data, function(obj){
				var lindex = S.indexOf(obj, _self.disableRecords);

				if(lindex > -1){
					_self.disableRecords.splice(lindex, 1);
				};
			});

			_self.fire('cancelDisableRecords', {'data': data});
		},

		// 加载数据
		_loadData : function(params){
			var _self = this,
				loadparams = params || {},
				data = null;
			
			/**
			* @private 设置结果
			*/
			function setResultLocal(resultRows, rowCount, totalCount){
				_self.resultRows = resultRows;
				_self.rowCount = rowCount;
				_self.totalCount = totalCount;

			}
			_self.fire('beforeload');

			// 设置 params参数 -上次请求参数 - 排序参数 - 分页信息 - 新parms
			var loadparamses = S.merge(_self.oldParams, _self.sortInfo, _self.pageInfo, loadparams);
			_self.oldParams = loadparamses;

			// 更新分页、排序、ajax config 信息
			_self.attrUpdater(loadparams);

			// 当数据为 jsonp 时候 method为get
			if(_self.proxy.dataType === 'jsonp'){
				_self.proxy.method = 'get';
			}
			
			// post vs get 方式参数格式化
			data = _self.proxy.method === 'post' ? loadparamses : (loadparamses ? S.param(loadparamses) : '');

			S.ajax({
				cache: false,
                url: _self.proxy.url,
                dataType: _self.proxy.dataType,
                type: _self.proxy.method,
                data: data,
                success : function (data, textStatus, XMLHttpRequest) {
					_self.fire('beforeProcessLoad', {data:data} );

					var resultRows=[],
						rowCount = 0,
						totalCount = 0;

					// 数据出错 
					if(data.hasError){
						setResultLocal(resultRows,rowCount,totalCount);
						_self.fire('exception',{error:data.error});
						return;
					}

					// jsonp支持
					if(S.isString(data)){
						try{
							data = S.json.parse(data);
						}catch(ec){
							S.log('json数据转换出错：' + ec);
						}
						
					}

					// 处理数据
					if(S.isArray(data)){
						resultRows = data;
						rowCount = resultRows.length;
						totalCount = rowCount;
						
					}else if (S.isObject(data)) {
						resultRows = data[_self.root];
						
						if (!resultRows) {
							resultRows = [];
						}
						rowCount = resultRows.length;
						totalCount = rowCount || parseInt(data[_self.totalProperty], 10); // 优选 数组计算 length 	后选择："results":21,
					} 

					setResultLocal(resultRows, rowCount, totalCount);

					// 前端 排序
                    if (_self.localSort) {
                        _self._sortData();
                    } 
					
					// 更新 总分页 信息					
					_self.setTotalPage( _self.calculatePageTotal() );
					
					_self.fire('load', {loadparams:loadparamses, data:data});
					
					_self._clearChanges();
                },

                error: function (XMLHttpRequest, textStatus, errorThrown) {
                   setResultLocal([], 0, 0);
				   _self.fire('exception',{error:textStatus,responseText:errorThrown.responseText});
                }
			});			
			
		},

		// 更新内置属性信息
		attrUpdater: function(loadparams){
			var _self = this;

			// ajax Config、 排序、分页信息 
			_self.proxy = S.mix(_self.proxy, loadparams, true, ['dataType', 'method']);
			_self.sortInfo = S.mix(_self.sortInfo, loadparams, true, ['field', 'direction']);
			_self.pageInfo = S.mix(_self.pageInfo, loadparams, true, ['currentPage', 'limit', 'totalPage']);
		},

		//移除数据 use
		_removeAt:function(index, array){
			if(index < 0){
				return;
			}
			var records = array || this.resultRows,
				record = records[index];

			records.splice(index,1);
			return record;
		},
		_removeFrom :function(record, array){
			var _self = this,
				index = S.indexOf(record, array);

			if(index >= 0){
				_self._removeAt(index, array);
			}
		},

		// 排序  排序字段 -- 排序方向 ASC || DSC -- 字段值类型
		/**
		* 排序方法 根据指定字段排序
		* @param {string} 
		* @ default {field:'', direction:'ASC', dataType:'string'}
		*/
		_sortData : function(field, direction, dataType){
			var _self = this;

			field = field || _self.sortInfo.field;
			direction = direction || _self.sortInfo.direction;
			dataType = dataType || _self.sortInfo.dataType;

			//如果未定义排序字段，则不排序
			if(!field || !direction){
				return;
			}
			_self.resultRows.sort(function(obj1, obj2){
				return _self.compare(obj1, obj2, field, direction, dataType);
			});
		},

		//获取默认的匹配函数
		_getDefaultMatch :function(){
			return this.matchFunction;
		},
	
		// 获取分页数
		calculatePageTotal: function(totalRows, length){
			var _self = this,
				recordNos = _self.getTotalCount(),
				limit = _self.getPageSize();
								
			if(!totalRows && !length){
				return Math.ceil(recordNos/limit);
			}
			
			return Math.ceil(totalRows/length); 
		},
		
		// 本地分页
		_localPagination: function(){
			var _self = this,				
				limit = _self.getPageSize(),
				nubs = _self.calculatePageTotal(); 

			// 设定 页数数据	
			var start = 0,
				end = 0,
				curPageData = [],
				totalLength = _self.getTotalPage(),
				page = _self.getCurrentPage();	

			// 第一次 暂存总数据
			if(!_self.totalData.length){
				_self.totalData = _self.getResult();
			} 	
			
			// 设定总页数
			_self.setTotalPage(nubs);
			
			// 分页数据	
			if(page < 1){
				page = 1;
			} 
			
			if(page > totalLength){
				page = totalLength;
			}	
			
			// 起始范围 -- 第一页 vs 最后一页
			start = page === 1 ? 0 : page*limit - limit;
			end = page === 1 ? limit : (page === totalLength ? undefined : page*limit);

			// 兼容ie
			if(end === undefined){
				curPageData = _self.totalData.slice(start);
			}else{
				curPageData = _self.totalData.slice(start, end);
			}
			
			// 缓存 当前页
			_self.setCurrentPage(page);

			// 修改 result 数据对象
			_self.resultRows = curPageData;

			return curPageData;
		},
		
		// 获取当前页面
		getCurrentPage: function(){
			var _self = this;
			return _self.pageInfo.currentPage;
		},

		// 设定当前页面
		setCurrentPage: function(curPage){
			var _self = this;

			if(S.isNumber(curPage) && curPage >= 0 ){				
				_self.pageInfo.currentPage = curPage;
				//_self.fire('currentPageChanged', {curPage: curPage});
				return curPage;
			}else{
				console.log('Invalid pagination value!');
			}
		},

		// 获取分页大小
		getPageSize: function(){
			var _self = this;
			return _self.pageInfo.limit;
		},

		// 获取总页数
		getTotalPage: function(){
			var _self = this;
			return _self.pageInfo.totalPage;
		},

		/**
		* 设置总页数 此方法会触发 totalPageChange事件  
		* @param {number} 设定总页数
		* @return {Object} 分页数据对象
		*/
		setTotalPage: function(totalPage){
			var _self = this,
				beforTotalPage = _self.getTotalPage();
			
			if(totalPage !== beforTotalPage && totalPage >= 0){				
				_self.pageInfo.totalPage = totalPage;
				_self.fire('totalPageChange');
			}
			return _self.pageInfo;
		},

		/**
		* 对象的匹配函数，验证两个对象是否相当
		* @field
		* @type Function
		* @default function(obj1,obj2){return obj1==obj2};
		* 
		*/
		matchFunction : function(obj1, obj2){
			var _self = this,
				dataField = _self.dataField,
				obj1Field = obj1[dataField],
				obj2Field = obj2[dataField];

			if( obj1Field !== undefined && obj2Field !== undefined){
				return obj1Field === obj2Field;
			}else{
				return obj1 === obj2;
			}				
		},

		/**
		* 排序方法 -- 支持 string || number(float) || date
		* field 排序字段
		*/
		compareFunction: function(obj1, obj2, dataType){
			var _self = this,
				obj1 = _self.dataMachining(obj1, dataType) || '',
				obj2 = _self.dataMachining(obj2, dataType) || '';
				
			if(S.isString(obj1)){
				return obj1.localeCompare(obj2);
			}else if(S.isNumber(obj1)){
				return obj1-obj2;
			}
		},

		/**
		* 根据指定类型  处理 排序数据
		* @param {string}
		* @return 处理过的数据
		*/
		dataMachining: function(value, valueType){
			if(!value){
				return;
			}

			switch(valueType){
				case 'float': return parseFloat(value); 
					break;

				case 'int': return parseInt(value, 10);
					break;

				case 'date': return new Date( Date.parse(value.replace(/\-/g,'/') ) );
					break;		

				default : return value.toString();	
			}	
		},

		//初始化 -- oldParams对象 -- url别名 -- resultRows
		_init : function(){
			var _self =this;

			_self.oldParams = _self.params || {};
			
			// ajax 配置 -- 简洁配置
			if(_self.url) {
                _self.proxy.url = _self.url;
            }
            if(_self.method) {
                _self.proxy.method = _self.method;
            }
            if(_self.dataType) {
                _self.proxy.dataType = _self.dataType;
            }

            // 分页信息 -- 简洁配置             
            if(S.isNumber(_self.totalPage) ) {
                _self.pageInfo.totalPage = _self.totalPage;
            }
            if(S.isNumber(_self.limit) ) {
                _self.pageInfo.limit = _self.limit;
            }
            if(S.isNumber(_self.currentPage) ) {
                _self.pageInfo.currentPage = _self.currentPage;
            }

			_self.resultRows = [];
		}
	});

	return Store;

}, {requires:[]});

