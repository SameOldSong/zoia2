!function(e){var n={};function o(a){if(n[a])return n[a].exports;var t=n[a]={i:a,l:!1,exports:{}};return e[a].call(t.exports,t,t.exports,o),t.l=!0,t.exports}o.m=e,o.c=n,o.d=function(e,n,a){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:a})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,n){if(1&n&&(e=o(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(o.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var t in e)o.d(a,t,function(n){return e[n]}.bind(null,t));return a},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="",o(o.s=15)}([function(e,n){e.exports=require("colors/safe")},function(e,n){e.exports=require("@babel/runtime/regenerator")},function(e,n){e.exports=require("fs-extra")},function(e,n){e.exports=require("@babel/runtime/helpers/asyncToGenerator")},function(e,n){e.exports=require("gettext-parser")},function(e,n){e.exports=require("colors")},function(e){e.exports=JSON.parse('{"admin":{"id":"admin","icon":"","admin":false,"adminRoute":"/admin/users"},"pages":{"id":"pages","icon":"file-text","admin":true,"adminRoute":"/admin/pages"},"users":{"id":"users","icon":"users","admin":true,"adminRoute":"/admin/users"}}')},function(e){e.exports=JSON.parse('{"secret":"79a947c3cbecfb5819b03f21eb00b3180e649bea0c189a7f4ff0bdd10e1fd292","authTokenExpiresIn":"7 days","cookieOptions":{"expires":14,"path":"/","domain":"","secure":false,"sameSite":"strict"},"mongo":{"url":"mongodb://localhost:27017","dbName":"sedna"},"originCORS":"*","trustProxy":true}')},function(e,n){e.exports=require("@babel/runtime/helpers/toConsumableArray")},function(e,n){e.exports=require("@babel/runtime/helpers/slicedToArray")},function(e,n){e.exports=require("inquirer")},function(e,n){e.exports=require("command-line-args")},function(e,n){e.exports=require("lodash/cloneDeep")},function(e,n){e.exports=require("mongodb")},function(e,n){e.exports=require("crypto")},function(e,n,o){"use strict";o.r(n);var a,t,r=o(1),c=o.n(r),s=o(8),i=o.n(s),l=o(3),u=o.n(l),d=o(9),p=o.n(d),m=o(10),f=o.n(m),g=o(11),b=o.n(g),x=o(0),h=o.n(x),v=o(2),y=o.n(v),_=o(4),O=o.n(_),k=o(12),j=o.n(k),S=o(13),w=[{name:"install",alias:"i",type:Boolean},{name:"modify",alias:"m",type:Boolean},{name:"split",alias:"s",type:Boolean},{name:"combine",alias:"c",type:Boolean},{name:"cleanup",alias:"d",type:Boolean}],P=b()(w),q=function(){var e=u()(c.a.mark(function e(){var n,t,r,s,l;return c.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=o(7),t=Object.keys(o(6)),r=[{type:"rawlist",name:"install",message:"Which modules to process?",choices:["All","None"].concat(i()(t)),default:"All"}],e.prev=3,console.log("This tool will run the module installation scripts."),console.log("Modules available: ".concat(t.join(", "))),console.log(""),e.next=9,f.a.prompt(r);case 9:return s=e.sent,console.log(""),l=new S.MongoClient(n.mongo.url,{useNewUrlParser:!0}),e.next=14,l.connect();case 14:if(a=l.db(n.mongo.dbName),"None"===s.install){e.next=18;break}return e.next=18,Promise.all(("All"===s.install?t:[s.install]).map(function(){var e=u()(c.a.mark(function e(n){var t,r,s;return c.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("".concat(h.a.green(" * ")," Processing module: ").concat(n,"...")),e.prev=1,t=o(16)("./".concat(n,"/database.json")),!(r=Object.keys(t.collections)).length){e.next=7;break}return e.next=7,Promise.all(r.map(function(){var e=u()(c.a.mark(function e(o){var r,s,i,l,u;return c.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("".concat(h.a.green(" * ")," Creating collection: ").concat(o,"...")),e.prev=1,e.next=4,a.createCollection(o);case 4:e.next=9;break;case 6:e.prev=6,e.t0=e.catch(1),console.log("".concat(h.a.green(" ! ")," Collection is not created: ").concat(o," (already exists?)"));case 9:if(r=t.collections[o],s=r.indexesAsc,i=r.indexesDesc,!s||!s.length){e.next=24;break}return console.log("".concat(h.a.green(" * ")," Creating ASC indexes for collection: ").concat(o,"...")),l={},s.map(function(e){return l[e]=1}),e.prev=14,e.next=17,a.collection(o).createIndex(l,{name:"".concat(n,"_asc")});case 17:e.next=24;break;case 19:e.prev=19,e.t1=e.catch(14),console.log(""),console.log(h.a.red(e.t1)),process.exit(1);case 24:if(!i||!i.length){e.next=38;break}return console.log("".concat(h.a.green(" * ")," Creating DESC indexes for collection: ").concat(o,"...")),u={},i.map(function(e){return u[e]=1}),e.prev=28,e.next=31,a.collection(o).createIndex(u,{name:"".concat(n,"_desc")});case 31:e.next=38;break;case 33:e.prev=33,e.t2=e.catch(28),console.log(""),console.log(h.a.red(e.t2)),process.exit(1);case 38:case"end":return e.stop()}},e,null,[[1,6],[14,19],[28,33]])}));return function(n){return e.apply(this,arguments)}}()));case 7:e.next=11;break;case 9:e.prev=9,e.t0=e.catch(1);case 11:return e.prev=11,console.log("".concat(h.a.green(" * ")," Running installation script for module: ").concat(n,"...")),s=o(19)("./".concat(n,"/install.js")),e.next=16,s.default(a);case 16:e.next=20;break;case 18:e.prev=18,e.t1=e.catch(11);case 20:case"end":return e.stop()}},e,null,[[1,9],[11,18]])}));return function(n){return e.apply(this,arguments)}}()));case 18:console.log("".concat(h.a.green(" * ")," Done")),l.close(),e.next=27;break;case 22:e.prev=22,e.t0=e.catch(3),console.log(""),console.log(h.a.red(e.t0)),process.exit(1);case 27:case"end":return e.stop()}},e,null,[[3,22]])}));return function(){return e.apply(this,arguments)}}();console.log(h.a.green.inverse("\n                                      ")),console.log(h.a.green.inverse(" Zoia 2 Helper Scripts                ")),console.log(h.a.green.inverse("                                      \n")),P.split&&(console.log("".concat(h.a.green(" * ")," Spliting locales...")),["user","admin"].map(function(e){console.log("".concat(h.a.green(" * ")," Processing area: ").concat(e)),y.a.readdirSync("".concat(__dirname,"/../shared/locales/combined/").concat(e)).filter(function(e){return"_build"!==e}).map(function(n){console.log("".concat(h.a.green(" * ")," Processing locale: ").concat(n));var o={},a=y.a.readFileSync("".concat(__dirname,"/../shared/locales/combined/").concat(e,"/").concat(n,"/messages.po")),t=O.a.po.parse(a),r=t.translations[""];Object.keys(r).map(function(e){if(e&&e.length&&r[e]&&r[e].comments){var n=r[e].comments.reference;n&&n.split(/\n/).map(function(n){var a=n.split(/\//),t=a.length>=2&&"modules"===a[0]?a[1]:"_core";o[t]||(o[t]={}),o[t][e]=r[e]})}}),Object.keys(o).map(function(a){if("_core"!==a){console.log("".concat(h.a.green(" * ")," Processing module: ").concat(a));var r="_core"===a?"".concat(__dirname,"/../shared/locales/core/").concat(n):"".concat(__dirname,"/../../modules/").concat(a,"/locales/").concat(e,"/").concat(n),c="_core"===a?"".concat(__dirname,"/../shared/locales/core/").concat(n,"/messages.po"):"".concat(__dirname,"/../../modules/").concat(a,"/locales/").concat(e,"/").concat(n,"/messages.po");y.a.ensureDirSync(r);var s=O.a.po.compile({charset:t.charset,headers:t.headers,translations:{"":o[a]}});y.a.writeFileSync(c,s)}})})}),console.log("".concat(h.a.green(" * ")," Done")),process.exit(0)),P.combine&&(t=Object.keys(o(6)),console.log("".concat(h.a.green(" * ")," Combining locales...")),["user","admin"].map(function(e){y.a.readdirSync("".concat(__dirname,"/../shared/locales/core")).filter(function(e){return"_build"!==e}).map(function(n){var o=y.a.readFileSync("".concat(__dirname,"/../shared/locales/core/").concat(n,"/messages.po")),a=O.a.po.parse(o),r=a.translations[""];t.map(function(o){if(y.a.existsSync("".concat(__dirname,"/../../modules/").concat(o,"/locales/").concat(e,"/").concat(n,"/messages.po"))){var a=y.a.readFileSync("".concat(__dirname,"/../../modules/").concat(o,"/locales/").concat(e,"/").concat(n,"/messages.po")),t=O.a.po.parse(a).translations[""];Object.keys(t).map(function(e){r[e]||(r[e]=t[e])})}});var c=O.a.po.compile({charset:a.charset,headers:a.headers,translations:{"":r}});y.a.writeFileSync("".concat(__dirname,"/../shared/locales/combined/").concat(e,"/").concat(n,"/messages.po"),c)})}),console.log("".concat(h.a.green(" * ")," Done")),process.exit(0)),P.cleanup&&(!function(){var e=Object.keys(o(6));console.log("".concat(h.a.green(" * ")," Cleaning up combined locales...")),["user","admin"].map(function(n){console.log("".concat(h.a.green(" * ")," Processing area: ").concat(n)),y.a.readdirSync("".concat(__dirname,"/../shared/locales/combined/").concat(n)).filter(function(e){return"_build"!==e}).map(function(o){console.log("".concat(h.a.green(" * ")," Processing locale: ").concat(o));var a=y.a.readFileSync("".concat(__dirname,"/../shared/locales/combined/").concat(n,"/").concat(o,"/messages.po")),t=O.a.po.parse(a),r=j()(t.translations[""]);Object.keys(r).map(function(n){if(r[n].comments&&r[n].comments.reference){var o=r[n].comments.reference.split(/\n/).filter(function(n){var o=n.split(/\//),a=p()(o,2),t=a[0],r=a[1];return"modules"!==t||!r||-1!==e.indexOf(r)});o.length?t.translations[""][n].comments.reference=o.join(/\n/):delete t.translations[""][n]}});var c=O.a.po.compile({charset:t.charset,headers:t.headers,translations:t.translations});y.a.writeFileSync("".concat(__dirname,"/../shared/locales/combined/").concat(n,"/").concat(o,"/messages.po"),c)})})}(),console.log("".concat(h.a.green(" * ")," Done")),process.exit(0)),P.install?q():console.log("Usage: node tools <--install (--modify)|--split|--combine|--cleanup>\n\n --install (-i): run Zoia installation, use --modify (-m) to modify existing config.json file\n --split (-s): split locales from shared directory to modules\n --combine locales from modules to shared directory\n --cleanup (-d): remove unused locale entries from shared directory")},function(e,n,o){var a={"./pages/database.json":17,"./users/database.json":18};function t(e){var n=r(e);return o(n)}function r(e){if(!o.o(a,e)){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}return a[e]}t.keys=function(){return Object.keys(a)},t.resolve=r,e.exports=t,t.id=16},function(e){e.exports=JSON.parse('{"collections":{"pages":{"indexesAsc":["path"]}}}')},function(e){e.exports=JSON.parse('{"collections":{"users":{"indexesAsc":["username","password","sessionId","email","active","admin"],"indexesDesc":["username","email","active","admin"]}}}')},function(e,n,o){var a={"./pages/install.js":20,"./users/install.js":21};function t(e){var n=r(e);return o(n)}function r(e){if(!o.o(a,e)){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}return a[e]}t.keys=function(){return Object.keys(a)},t.resolve=r,e.exports=t,t.id=19},function(e,n,o){"use strict";o.r(n);var a=o(1),t=o.n(a),r=o(3),c=o.n(r),s=o(5),i=o.n(s),l=function(){var e=c()(t.a.mark(function e(n){return t.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("".concat(i.a.green(" * ")," Inserting or updating default page (/)...")),e.next=3,n.collection("pages").updateOne({path:"/"},{$set:{path:"/",data:{en:{title:"Home Page",content:'Zoia has been installed successfully.<br />Go to <a href="/admin">admin panel</a> to get things done.'},ru:{title:"Главная",content:'Инсталляция Zoia успешно завершена.<br />Вы можете перейти к <a href="/admin">панели администратора</a> для завершения настройки.'}}}},{upsert:!0});case 3:case"end":return e.stop()}},e)}));return function(n){return e.apply(this,arguments)}}();n.default=l},function(e,n,o){"use strict";o.r(n);var a=o(1),t=o.n(a),r=o(3),c=o.n(r),s=o(14),i=o.n(s),l=o(5),u=o.n(l),d=o(7),p=function(){var e=c()(t.a.mark(function e(n){var o;return t.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("".concat(u.a.green(" * ")," Inserting or updating default user (admin)...")),o=i.a.createHmac("sha512",d.secret).update("password").digest("hex"),e.next=4,n.collection("users").updateOne({username:"admin"},{$set:{username:"admin",password:o,email:"example@zoiajs.org",active:1,admin:1}},{upsert:!0});case 4:case"end":return e.stop()}},e)}));return function(n){return e.apply(this,arguments)}}();n.default=p}]);