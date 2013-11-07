KISSY.add(function(S){
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

