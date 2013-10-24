/** @fileOverview 对KISSY进行扩展的一些帮助函数
* 包括：格式化函数，Form帮助类 
* @version 1.0.0  
*/
KISSY.add('gallery/tmSimpleGrid/1.0/TL', function(S, Calendar){

	var Event = S.Event,
		DOM = S.DOM,
		Anim = S.Anim,
		Ajax = S.io,
		S_Date = S.Date,
		JSON = S.JSON,
		UA = S.UA,
		win = window,
		doc = document;
		  
	function TL(){
        var _self = this;

        if( !(_self instanceof TL) ){
        	return new TL();
        }
    }
	 
	S.extend(TL, S.Base);
    S.augment(TL, {
		/**
			@description 日期格式化函数
			@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
			@return {String} 格式化后的日期格式为 2011-10-31
			@example
		* 一般用法：<br> 
		* S.TL.Format.dateRenderer(1320049890544);输出：2011-10-31 <br>
		* 表格中用于渲染列：<br>
		* {title:"出库日期",dataIndex:"date",renderer:S.TL.Format.dateRenderer}
		*/
		dateRenderer: function (d) {
			if(!d){
				 return '';
			}
			if(S.isString(d)){
				return d;
			}
			var date = null;
            try {
                date =new Date(d);
            } catch (e) {
                return '';
            }
            if (!date || !date.getFullYear){
                return '';
            }
            return S_Date.format(d,'yyyy-mm-dd');
        },
        
		/**
			@description 日期时间格式化函数
			@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
			@return {String} 格式化后的日期格式时间为 2011-10-31 16 : 41 : 02
		*/
		datetimeRenderer: function (d) {
			if(!d){
				 return '';
			}
			if(S.isString(d)){
				return d;
			}
			var date = null;
            try {
                date =new Date(d);
            } catch (e) {
                return '';
            }
            if(!date || !date.getFullYear){
            	return '';
            }
            return S_Date.format(d,'yyyy-mm-dd HH:MM:ss');
		},		

		/*
		* @description 根据日期时间字符串 返回日期对象
		* @param {String} 
		* @return {obj} date obj 
		*/
		getDateParse: function(dateStr){
			return S_Date.parse(dateStr.replace(/\-/g,'/'));
		},
		
		/*
		* @description 根据字符串日期 获取日期毫秒数，支持 前后时间 推移
		* @param {Number|String} 
		* @return {obj} date obj 
		*/
		getDateObj: function(dateStr, offset, PreviousLater){
			var dataParse = dateStr ? S.TL.getDateParse(dateStr) : (new Date()).getTime(),
				offsetParse = offset ? offset * 86400000 : 0,
				dataTime;

			switch(PreviousLater){
				case '+' : dataTime = dataParse + offsetParse;
					break;
				case '-' : dataTime = dataParse - offsetParse;
					break;
				default: dataTime = dataParse;
			}

			return new Date(dataTime);
		},

		/**
			@description 文本截取函数，当文本超出一定数字时，会截取文本，添加...
			@param {Number} length 截取多少字符
			@return {function} 返回处理函数 返回截取后的字符串，如果本身小于指定的数字，返回原字符串。如果大于，则返回截断后的字符串，并附加...
		*/
		cutTextRenderer: function(length){
			return function(value){
				value = value || '';

				if(value.toString().length > length){
					return value.toString().substring(0,length)+'...';
				}
				return value;
			};
		},
		
		/*
		* @description 根据字符串、数字值-- 判断数据类型 -- string || date、 float || int
		* @param {Number|String|} 
		* @return {string} 返回 数据类型
		*/
		strToDataType: function(value){
			var dataType = 'string',
				date = '',
				val = parseInt(value, 10),
				isNumber = S.isNumber(value),
				isString = S.isString(value);
			
			if(!value){
				return;
			}
			
			if(isNumber){				
				if(/\./g.test(value)){					
					dataType = 'float';
				}else{
					dataType = 'int';
				}				
			}else if(isString){
				date = this.getDateParse(value);
				if(date.getFullYear){
					dataType = 'date';
				}
			}
			return dataType;
		},	
		
		/*
		* @description 将财务数据分转换成元
		* @param {Number|String} 
		* @return {Number} 返回将 分转换成 元的数字
		*/
		moneyCentRenderer: function(v, fixed){
			if(S.isString(v)){
				v = parseFloat(v);
			}
			if(S.isNumber(v)){
				return (v * 0.01).toFixed( fixed || 2);
			}
			return v;
		},
		/**
		* @description 根据路径 深层遍历对象,获取 最终值; 
		* @param {object|String} String多个key 直接用'.'号隔开; 例如: object --> 'aa.bb.cc.dd.ee' 
		* @return {value}
		*/
    	getFiledValue: function(obj, index){
			if( !obj && !index){
				return;
			}

			var resultData = obj,
				aindex = index.split('.');

			S.each(aindex, function(dataIndex){
				if(resultData){
					resultData = resultData[dataIndex];
				}
			});

			return resultData;
		},
		
		/*
		* @description 公用方法--- 遍历 选中/取消 既定文档作用域, 指定cls钩子的 checkbox, 设置checked状态
		* @param {string|boolean|document} class 钩子-- 是否选中 --- 文档作用域
		* @return {array} 选中的checkbox value值 数组
		*/
    	selectedAllBox: function(cls, isChecked, thatDoc){
    		var selectedAry = [],	
    			thatDoc = thatDoc || document, 
                groupRadios = S.query(cls, thatDoc);
                
            S.each(groupRadios, function(el){
            	var trID = DOM.val(el);

				if(isChecked){
					el.checked = 'checked';
					selectedAry.push(trID);
				}else{
					el.checked = '';
					DOM.removeAttr(el, 'checked');
				}               
            });

			return selectedAry;
    	},
		/**
		* 将表单数据序列化成为字符串
		* @param {HTMLForm} form 表单元素
		* @return {String} 序列化的字符串
		*/
		serialize:function(form){
			return S.param(S.TL.serializeToObject(form));
		},
		/**
		* 将表单数据序列化成对象
		* @param {HTMLForm} form 表单元素
		* @return {Object} 表单元素的
		*/
		serializeToObject:function(form){
			var originElements = S.makeArray(form.elements),
				elements = null,
				arr =[],
				checkboxElements = null,
				result={};

			elements = S.filter(originElements, function(item){
				// 有name或者有id
				// 未被禁用 -- disabled="disabled"
				// 选中状态
				// select|textarea |input  nodeName
				// text|hidden|password |radio|checbox  input.type

				return (item.id ||item.name) && !item.disabled && ( item.checked || /select|textarea/i.test(item.nodeName) || /text|hidden|password/i.test(item.type) );
			});

			//checkbox 做特殊处理，如果所有checkbox都未选中时,设置字段为空
			checkboxElements = S.filter(originElements, function(item){
				return ( item.id ||item.name) && !item.disabled &&(/checkbox/i.test(item.type) );
			});

			// 创建参数数据对象
			S.each(elements,function(elem){
				var val = S.one(elem).val(),
					name = elem.name||elem.id,
					obj = val == null ? {name:  name, value: ''} : S.isArray(val) ?
					S.map( val, function(val, i){
						return {name: name, value: val};
					}) :
					{name:  name, value: val};

				if(obj){
					arr.push(obj);
				}
			});

			//组合对象
			S.each(arr, function(elem){
				var prop = result[elem.name],
					a = []; //临时变量

				if(!prop){
					result[elem.name] = elem.value;
				}else if(S.isArray(prop)){
					prop.push(elem.value);
				}else{
					a.push(prop);
					a.push(elem.value);
					result[elem.name]=a;
				}
			});

			//检查checkbox的字段是否在对象中，不在则置为空
			S.each(checkboxElements, function(elem){
				var name = elem.name || elem.id;

				if(!result.hasOwnProperty(name)){
					result[name] = '';
				}
			});
			
			return result;
		},

		/**
		* encodeURI 异步参数
		* @param  {String || array || json, Boolean} 将要encodeURI 内容，是否2次转码Boolean值
		* @return {String || array || json} encodeURI 后的 值
		*/
    	encodeURIParam: function(vals, isDoubEncode){
    		var _self = this;

    		if(!vals){
    			return;
    		}

    		// 字符串
    		if(S.isString(vals)){
    			return isDoubEncode ? encodeURI(encodeURI(vals)) : encodeURI(vals);
    		}

    		// 数组 字符串 
    		if(S.isArray(vals)){
    			S.each(vals, function(val, i){
    				vals[i] = isDoubEncode ? encodeURI(encodeURI(val)) : encodeURI(val);
    			});
    			return vals;
    		}

    		// json数据对象
    		if(S.isObject(vals)){
    			S.each(vals, function(value, index){
    				vals[index] = _self.encodeURIParam(value, isDoubEncode);
    			});
    			return vals;
    		}

    		// 其他直接输出 -- number || boolean ..
    		return vals;
    	}
	});
	
	S.TL = S.namespace('TL');
	S.TL = new TL();

	return new TL();
	
}, {requires: ['calendar', 'core']});