(this.webpackJsonpmyfirstreact=this.webpackJsonpmyfirstreact||[]).push([[0],[,,,,,function(e,t,a){e.exports=a.p+"static/media/delete-black.56397e00.svg"},function(e,t,a){e.exports=a.p+"static/media/expand_more-black.3f4f518f.svg"},,function(e,t,a){e.exports=a.p+"static/media/cancel-black.59cdabfc.svg"},function(e,t,a){e.exports=a.p+"static/media/save-black.618caa8c.svg"},,,function(e,t,a){e.exports=a(22)},,,,,function(e,t,a){},function(e,t,a){},function(e,t,a){e.exports=a.p+"static/media/edit-black.2de08358.svg"},function(e,t,a){},function(e,t,a){e.exports=a.p+"static/media/print-black.97185797.svg"},function(e,t,a){"use strict";a.r(t),a.d(t,"AppContext",(function(){return j})),a.d(t,"App",(function(){return O}));var n=a(1),r=a(0),c=a.n(r),o=a(10),i=a.n(o),l=(a(17),function(){var e=Object(r.useContext)(j),t=Object(n.a)(e,8),a=(t[0],t[1],t[2],t[3],t[4],t[5]);t[6],t[7];return c.a.createElement("input",{className:"searchBar",type:"text",id:"searchBar",placeholder:"Search",onChange:function(e){return a(e.target.value)}})}),s=function(){var e=Object(r.useContext)(j),t=Object(n.a)(e,8);t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7];return c.a.createElement("div",{className:"navbar"},c.a.createElement("div",{className:"search-group"},c.a.createElement("div",{className:"categories-dropdown",onClick:function(){return document.body.classList.toggle("cat-is-open")}},c.a.createElement("div",{className:"categories-selected"},"All"),c.a.createElement("img",{className:"categories-button blue-hover"})),c.a.createElement(l,null)),c.a.createElement("div",{className:"title"},"Groceries"),c.a.createElement("img",{className:"cart-button blue-hover",onClick:function(){return document.body.classList.toggle("cart-is-open")}}))},u=a(2),d=function(){var e=Object(r.useContext)(j),t=Object(n.a)(e,8),a=t[0],o=(t[1],t[2]),i=t[3];t[4],t[5],t[6],t[7];return c.a.createElement("div",{className:"categories",onClick:function(){return document.body.classList.remove("cat-is-open")}},Object(u.a)(new Set(["All"].concat(Object(u.a)(a.map((function(e){return e.category})).sort((function(e,t){return e.category>t.category?1:t.category>e.category?-1:0})))))).map((function(e){return e===o?c.a.createElement("div",{className:"category category-target",key:e,onClick:function(){return i(e)}},e):c.a.createElement("div",{className:"category",key:e,onClick:function(){return i(e)}},e)})))},m=a(11);var p=function(e){var t=e||window.event;if("paste"!==t.type){var a=String.fromCharCode(t.keyCode);/\d/.test(a)&&(t.returnValue=!1,t.preventDefault&&t.preventDefault())}else t.returnValue=!1},v=(a(18),"http://localhost:8080"),f=function(e){var t=Object(r.useContext)(j),o=Object(n.a)(t,8),i=o[0],l=(o[1],o[2],o[3]),s=(o[4],o[5],o[6],o[7],Object(r.useContext)(h)),d=Object(n.a)(s,2),m=d[0],f=(d[1],Object(r.useState)(e.name)),g=Object(n.a)(f,2),E=g[0],b=g[1],y=Object(r.useState)(e.category),N=Object(n.a)(y,2),C=N[0],O=N[1],x=Object(r.useState)(null),w=Object(n.a)(x,2),P=w[0],k=w[1],D=Object(r.useState)(!1),L=Object(n.a)(D,2),S=(L[0],L[1],Object(r.useState)(!1)),T=Object(n.a)(S,2),I=T[0],B=T[1],A=Object(r.useState)(!1),R=Object(n.a)(A,2),U=R[0],M=R[1];function F(t){fetch(v+"/cart/"+e.name,{method:"PUT",body:JSON.stringify({value:t})}).then((function(){return e.refreshProducts()})).catch((function(e){console.log(e)}))}var H=function(e){e.preventDefault(),e.stopPropagation(),e.target.classList.add("drop-target")}.bind(void 0);var J=function(e){e.preventDefault(),e.stopPropagation(),e.target.classList.remove("drop-target")}.bind(void 0);var G=function(e){e.preventDefault(),e.stopPropagation()}.bind(void 0);var K=function(t){t.preventDefault(),t.stopPropagation(),t.target.classList.remove("drop-target");var a=t.dataTransfer.getData("text/plain");console.log(a||Object(u.a)(t.dataTransfer.files)),a?(console.log("Please drop a file instead of an URL"),alert("Please drop a file instead of an URL")):function(t){for(var a,n=document.getElementById("canvas-create-"+e.name),r=n.getContext("2d"),c=0;c<t.length;c++){a=t[c];a.type.match(/image.*/)}k(a);var o=document.createElement("img"),i=new FileReader;i.onload=(l=o,function(e){l.onload=function(){var e=94/l.width;l.width<l.height&&(e=94/l.height);var t=Math.floor(l.width*e,10),a=Math.floor(l.height*e,10);r.clearRect(0,0,n.width,n.height),r.drawImage(l,n.width/2-t/2,n.height/2-a/2,t,a)},l.src=e.target.result}),i.readAsDataURL(a);var l}(t.dataTransfer.files)}.bind(void 0);return c.a.createElement("div",{className:"product",id:"product-card-"+e.name},c.a.createElement("div",{className:["product-card",U?" deleting":"",I?" editing":""].join("")},c.a.createElement("div",{className:"product-front-side"},c.a.createElement("div",{className:"product-card-update"},c.a.createElement("img",{className:"product-card-icon red-hover",src:a(5),onClick:function(){return M(!0)},alt:"Delete icon"}),c.a.createElement("img",{className:"product-card-icon blue-hover",src:a(19),onClick:function(){return B(!0)},alt:"Edit icon"}),c.a.createElement("img",{className:"product-card-expand",src:a(6),alt:"Expand icon"})),c.a.createElement("div",{className:"product-card-title"},e.name),c.a.createElement("img",{src:v+"/images/"+e.name+"?"+m[e.name]}),c.a.createElement("div",{className:"product-card-input"},c.a.createElement("img",{className:"product-card-input-minus",onClick:function(){return F(e.value-1)}}),c.a.createElement("div",null,c.a.createElement("input",{type:"text",className:"product-card-input-text",onKeyPress:p.bind(void 0),onChange:function(e){return F(e.target.value)},value:e.value})),c.a.createElement("img",{className:"product-card-input-plus",onClick:function(){return F(e.value+1)}}))),c.a.createElement("div",{className:"product-card-editing"},c.a.createElement("div",{className:"product-card-update"},c.a.createElement("img",{className:"product-card-icon blue-hover",src:a(8),onClick:function(){return B(!1)},alt:"Cancel icon"}),c.a.createElement("img",{className:"product-card-icon blue-hover",src:a(9),onClick:function(){return function(){if(i.some((function(e){return e.category===C}))||window.confirm("Are you sure you want to create the new category "+C+"?")){var t=new FormData;t.append("name",E),t.append("category",C),t.append("image",P),fetch(v+"/products/"+e.name,{method:"PUT",body:t}).then((function(t){200===t.status?(m[E]=(m[E]||0)+1,e.refreshProducts(),B(!1)):409===t.status&&alert("A product with that name already exists")})).catch((function(e){console.log(e)}))}}()},alt:"Save icon"}),c.a.createElement("img",{className:"product-card-expand",src:a(6),alt:"Expand icon"})),c.a.createElement("input",{type:"text",className:"product-card-name",placeholder:e.name,onChange:function(e){return b(e.target.value)}}),c.a.createElement("div",{className:"product-card-background"}),c.a.createElement("img",{className:"transparent-image",src:v+"/images/"+e.name+"?"+m[e.name]}),c.a.createElement("div",{className:"drop-text"},"Drop New Image Here"),c.a.createElement("canvas",{className:"canvas-preview",id:"canvas-create-"+e.name,width:94,height:94}),c.a.createElement("div",{className:"product-add-image",onDragEnter:H,onDragLeave:J,onDragOver:G,onDrop:K}),c.a.createElement("input",{type:"text",className:"product-card-category",placeholder:e.category,onChange:function(e){return O(e.target.value)}})),c.a.createElement("div",{className:"product-back-side"},c.a.createElement("div",{className:"product-card-title"},e.name),c.a.createElement("div",{className:"product-back-delete",onClick:function(){fetch(v+"/products/"+e.name,{method:"DELETE"}).then((function(t){if(200===t.status){var a=document.getElementById("product-card-"+e.name);a.style.opacity="0",window.setTimeout((function(){a.style.display="none",e.refreshProducts(),1===i.filter((function(t){return t.category===e.category})).length&&l("All")}),1250)}})).catch((function(e){console.log(e)}))}},"Delete"),c.a.createElement("div",{className:"product-back-cancel",onClick:function(){return M(!1)}},"Cancel"))))},g=function(e){var t=Object(r.useContext)(j),o=Object(n.a)(t,8),i=(o[0],o[1],o[2],o[3],o[4],o[5]),l=(o[6],o[7],Object(r.useContext)(h)),s=Object(n.a)(l,2),d=s[0],p=(s[1],Object(r.useState)("")),f=Object(n.a)(p,2),g=f[0],E=f[1],b=Object(r.useState)(""),y=Object(n.a)(b,2),N=y[0],C=y[1],O=Object(r.useState)(null),x=Object(n.a)(O,2),w=x[0],P=x[1],k=Object(r.useState)(!1),D=Object(n.a)(k,2),L=D[0],S=D[1],T=function(e){return E(e.target.value)},I=function(e){e.preventDefault(),e.stopPropagation(),e.target.classList.add("drop-target")}.bind(void 0);var B=function(e){e.preventDefault(),e.stopPropagation(),e.target.classList.remove("drop-target")}.bind(void 0);var A=function(e){e.preventDefault(),e.stopPropagation()}.bind(void 0);var R=function(e){e.preventDefault(),e.stopPropagation(),e.target.classList.remove("drop-target");var t=e.dataTransfer.getData("text/plain");console.log(t||Object(u.a)(e.dataTransfer.files)),t?(console.log("Please drop a file instead of an URL"),alert("Please drop a file instead of an URL")):function(e){for(var t,a=document.getElementById("canvas-create"),n=a.getContext("2d"),r=0;r<e.length;r++){t=e[r];t.type.match(/image.*/)}P(t);var c=document.createElement("img"),o=new FileReader;o.onload=(i=c,function(e){i.onload=function(){var e=94/i.width;i.width<i.height&&(e=94/i.height);var t=Math.floor(i.width*e,10),r=Math.floor(i.height*e,10);n.clearRect(0,0,a.width,a.height),n.drawImage(i,a.width/2-t/2,a.height/2-r/2,t,r)},i.src=e.target.result}),o.readAsDataURL(t);var i}(e.dataTransfer.files)}.bind(void 0);function U(){document.getElementById("searchBar").value="",i("")}return c.a.createElement("div",{className:"product"},c.a.createElement("div",{className:["product-card",L?" creating":"",L?" editing":""].join("")},c.a.createElement("div",{className:"product-create-prompt"},c.a.createElement("div",{className:"product-create-text"},"Product does not exist."),c.a.createElement("div",{className:"product-create-text"},"Do you want to create it?"),c.a.createElement("div",{className:"product-create-button",onClick:function(){return S(!0)}},"Create"),c.a.createElement("div",{className:"product-back-cancel",onClick:function(){return U()}},"Cancel")),c.a.createElement("div",{className:"product-card-creating"},c.a.createElement("div",{className:"product-card-update"},c.a.createElement("img",{className:"product-card-icon blue-hover",src:a(8),onClick:function(){return U()},alt:"Cancel icon"}),c.a.createElement("img",{className:"product-card-icon blue-hover",src:a(9),onClick:function(){return function(){var t=new FormData;t.append("name",g),t.append("category",N),t.append("image",w),fetch(v+"/products",{method:"POST",body:t}).then((function(t){200===t.status?(d[g]=(d[g]||0)+1,i(g),e.refreshProducts()):409===t.status&&alert("A product with that name already exists")})).catch((function(e){})),document.getElementById("searchBar").value=g,i(g)}()},alt:"Save icon"}),c.a.createElement("img",{className:"product-card-expand",src:a(6),alt:"Expand icon"})),c.a.createElement("input",Object(m.a)({type:"text",className:"product-card-name",onChange:T,placeholder:"Name"},"onChange",T)),c.a.createElement("div",{className:"product-card-background"}),c.a.createElement("div",{className:"drop-text"},"Drop New Image Here"),c.a.createElement("canvas",{className:"canvas-preview",id:"canvas-create",width:94,height:94}),c.a.createElement("div",{className:"product-add-image",onDragEnter:I,onDragLeave:B,onDragOver:A,onDrop:R}),c.a.createElement("input",{type:"text",className:"product-card-category",placeholder:"Category",onChange:function(e){return C(e.target.value)}}))))},h=Object(r.createContext)();var E=function(e){var t=Object(r.useContext)(j),a=Object(n.a)(t,8),o=a[0],i=(a[1],a[2]),l=(a[3],a[4]),s=(a[5],a[6],a[7],Object(r.useState)([])),u=Object(n.a)(s,2),d=u[0],m=u[1];return c.a.createElement("div",null,function(){var t=function(e,t,a){if(void 0===a||""===a)return e;var n=[],r=t.toLowerCase(),c=a.toLowerCase();for(var o in e){var i=e[o].name.toLowerCase(),l=e[o].category.toLowerCase();"All"!==t&&l!==r||!i.includes(c)&&!l.includes(c)||n.push(e[o])}return n}(o,i,l);return function(e,t){if(void 0===t||""===t)return!0;var a=t.toLowerCase();for(var n in e)if(e[n].name.toLowerCase()===a||e[n].category.toLowerCase()===a)return!0;return!1}(o,l)?c.a.createElement(h.Provider,{value:[d,m]},c.a.createElement("div",{className:"product-container"},t.map((function(t){return c.a.createElement("div",{className:"product-grid-item",key:t.name},c.a.createElement(f,{refreshProducts:e.refreshProducts,name:t.name,category:t.category,value:t.value}))})))):c.a.createElement(h.Provider,{value:[d,m]},c.a.createElement("div",{className:"product-container"},c.a.createElement(g,{refreshProducts:e.refreshProducts}),t.map((function(t){return c.a.createElement("div",{className:"product-grid-item",key:t.name},c.a.createElement(f,{refreshProducts:e.refreshProducts,name:t.name,category:t.category,value:t.value}))}))))}())};a(20);function b(e){return e.sort((function(e,t){return e.category!==t.category?e.category>t.category?1:-1:e.name>t.name?1:t.name>e.name?-1:0}))}var y=function(e){var t=Object(r.useContext)(j),o=Object(n.a)(t,8),i=o[0];o[1],o[2],o[3],o[4],o[5],o[6],o[7];return c.a.createElement("div",{className:"cart-navbar"},c.a.createElement("img",{className:"cart-navbar-print blue-hover",src:a(21),onClick:function(){var e=b(i),t=document.createElement("div"),a="";for(var n in e){var r=e[n],c=document.createElement("div");r.value>0&&(a!==r.category&&(""!==a&&c.appendChild(document.createElement("br")),c.appendChild(document.createTextNode(r.category)),c.appendChild(document.createElement("br")),a=r.category),c.appendChild(document.createTextNode(r.name+" "+r.value)),t.appendChild(c))}document.getElementById("root").style.display="none",document.getElementById("list").innerHTML="",document.getElementById("list").append(t),window.print(),document.getElementById("list").innerHTML="",document.getElementById("root").style.display="block"},alt:"Print icon"}),c.a.createElement("div",{className:"cart-title"},"Shopping List"),c.a.createElement("img",{className:"cart-navbar-delete red-hover",src:a(5),onClick:function(){fetch(v+"/cart",{method:"DELETE"}).then((function(t){200===t.status&&e.refreshProducts()})).catch((function(e){console.log(e)}))},alt:"Delete icon"}))},N=function(e){var t=Object(r.useContext)(j),o=Object(n.a)(t,8),i=(o[0],o[1],o[2],o[3],o[4],o[5],o[6],o[7],function(t){var a=parseInt(t.target.value,10);fetch(v+"/cart/"+e.name,{method:"PUT",body:JSON.stringify({value:a})}).then((function(e){return e.json()})).then((function(){e.refreshProducts()})).catch((function(e){console.log(e)}))}.bind(void 0));return c.a.createElement("div",{className:"cart-product"},c.a.createElement("p",{className:"cart-product-name"},e.name),c.a.createElement("input",{className:"cart-product-input",type:"text",onKeyPress:p.bind(void 0),onChange:i,value:e.value}),c.a.createElement("img",{className:"cart-product-delete red-hover",src:a(5),onClick:function(){fetch(v+"/cart/"+e.name,{method:"DELETE"}).then((function(t){200===t.status&&e.refreshProducts()})).catch((function(e){console.log(e)}))},alt:"Delete icon"}))},C=function(e){var t=Object(r.useContext)(j),a=Object(n.a)(t,8),o=a[0];a[1],a[2],a[3],a[4],a[5],a[6],a[7];return c.a.createElement("div",{className:"cart"},c.a.createElement(y,{refreshProducts:e.refreshProducts}),function(){var t=[],a=b(o),n="";for(var r in a)a[r].value>0&&(n!==a[r].category&&(t.push(c.a.createElement("div",{key:"Category"+a[r].category,className:"cart-category-title"},a[r].category)),n=a[r].category),t.push(c.a.createElement("div",{key:"Product"+a[r].name},c.a.createElement(N,{refreshProducts:e.refreshProducts,name:a[r].name,category:a[r].category,value:a[r].value}))));return t}())},j=Object(r.createContext)(),O=function(){var e=Object(r.useState)([]),t=Object(n.a)(e,2),a=t[0],o=t[1];0===a.length&&x();var i=Object(r.useState)("All"),l=Object(n.a)(i,2),u=l[0],m=l[1],p=Object(r.useState)(!1),f=Object(n.a)(p,2),g=f[0],h=f[1],b=Object(r.useState)(""),y=Object(n.a)(b,2),N=y[0],O=y[1];function x(){fetch(v+"/products",{method:"GET"}).then((function(e){return e.json()})).then((function(e){fetch(v+"/cart",{method:"GET"}).then((function(e){return e.json()})).then((function(t){!function(e,t,a){var n=[],r=function(t){n.push({name:e[t].name,category:e[t].category,value:a.find((function(a){return a.name===e[t].name}))?a.find((function(a){return a.name===e[t].name})).value:0})};for(var c in e)r(c);n.sort((function(e,t){return e.name>t.name?1:t.name>e.name?-1:0})),t(n)}(e,o,t)})).catch((function(e){console.log(e)}))})).catch((function(e){console.log(e)}))}return c.a.createElement("div",{className:"page"},c.a.createElement(j.Provider,{value:[a,o,u,m,N,O,g,h]},c.a.createElement(s,null),c.a.createElement(E,{refreshProducts:x}),c.a.createElement(C,{refreshProducts:x}),c.a.createElement(d,null)))};i.a.render(c.a.createElement(O,null),document.getElementById("root"))}],[[12,1,2]]]);
//# sourceMappingURL=main.989d8295.chunk.js.map