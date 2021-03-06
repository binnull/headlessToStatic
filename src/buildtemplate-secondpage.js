// 循环生成模版中心二级页面队列
const request = require('request');
const fs = require('fs');
const config = require('../config/config');
const loadPage = require('./loadPage');
const initRoute = require('./initRoute');
const templatecenter = require('../template/templatecenter');

const buildSecondPage = function(opts) {
  let fid = opts.fid;                     // 一级分类id，不能为空
  let sid = opts.sid || null;             // 二级分类id
  let tags = opts.tags || [{tagId: null}];         // 标签
  let orders = [0,1,2,3];                 // 排序
  let priceTypes = [0,1,2,3];             // 价格

  // 先循环tags层
  for(let i = 0;i < tags.length;i++) {

    let tag = tags[i].tagId;

    // 排序层
    for(let j = 0;j < orders.length;j++) {

      let order = orders[j];
      
      // 价格层
      for(let n = 0;n < priceTypes.length;n++) {
        
        let priceType = priceTypes[n];

        // 请求模版参数
        let data = {};
        let route_data = {};

        data.parentKindId = fid;
        route_data.pi = fid;
        if(sid) {
          data.secondKindId = sid;
          route_data.si = sid;
        }
        if(tag) {
          data.tagId = tag;
          route_data.ti = tag;
        }
        data.timeOrder = order;
        route_data.o = order;
        data.priceType = priceType;
        route_data.pt = priceType;
        data.pageNo = 1;
        route_data.pn = 1;
        

        // 请求链接
        let route = initRoute(data, '=', '&');

        // 请求当前情况一共有多少页
        request(config.api + '/designtemplate/getAllTemplates.do?_dataType=json&' + route, (error, response, body) => {
          if(!error) {
            request('http:' + JSON.parse(body).body.cacheUrl, (error, response, body) => {
              if(!error) {
                // 当前情况的所有数量
                let result = JSON.parse(body).body;
                let sum = parseInt(result.totalCount);
                let num = parseInt(result.resultCount);
                let pageSum = Math.ceil(sum / num);
                
                for(let m = 1;m <= pageSum;m++) {
                  data.pageNo = m;
                  route_data.pn = m;
                  // 页面链接
                  let page_route = initRoute(route_data, '_', '-');
                  loadPage(config.host + '/templatecenter/secondpage-' + page_route, (err, stdout, stderr) => {
                    fs.writeFile('html/templatecenter/secondpage-' + page_route, templatecenter(stdout), (werr) => {
                      global.buildPageNum++;
                      console.log('生成数量：' + global.buildPageNum);

                      console.log('生成路径：/templatecenter/secondpage-' + page_route);
                    })
                  });
                }

                
              }
            });
          }
        });

      }

    }

  }

}

module.exports = buildSecondPage;
