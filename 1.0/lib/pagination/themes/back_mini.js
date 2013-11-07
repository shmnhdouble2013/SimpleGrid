KISSY.add('mui/pagination/t/back_mini', function(S){
  var template = [
   '{{#if ((endPage - startPage)>0) && (currentPage <= endPage)}}',
    '<div class="mui-page-s">',
      '<b class="mui-page-s-len">{{currentPage}}/{{endPage}}</b>',
      '{{#if currentPage > startPage}}',
        '<a class="mui-page-s-prev" href="#" data-page="{{ currentPage - 1 }}" title="上一页">&lt;</a>',
      '{{#else}}',
        '<b class="mui-page-s-prev" title="上一页">&lt;</b>',
      '{{/if}}',
      '{{#if currentPage < endPage}}',
        '<a class="mui-page-s-next" href="#" data-page="{{ currentPage + 1 }}" title="下一页">&gt;</a>',
      '{{#else}}',
        '<b class="mui-page-s-next" title="下一页">&gt;</b>',
      '{{/if}}',
    '</div>',
   '{{/if}}'].join('');
  	return template;
},{requires:['mui/pagination/back.css', 'mui/button/btn.css']});
