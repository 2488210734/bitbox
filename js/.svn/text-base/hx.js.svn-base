(function($) {
	$.apiaddress = "https://horizon.stellar.org";
	//$.sourceSecretKey = 'SD2EPK3BKBDK2L2M2RQVBNVLLV4PU4JJGWLEGA37L26OTIH4YUO4DM5B'; //这里先用于测试
	//$.sourceSecretKey = "";
	//$.setItem("showlock","1");
	$.requesttime = new Date().getTime() - 5000; //当前时间，用于计算请求间隔

	mui.plusReady(function() {
		$.getItem = function(s) { //重写数据读写操作，手机上用原生存储（如果用h5方法存储在退出应用时会被清空）
			return plus.storage.getItem(s);
		}
		$.setItem = function(s, v) {
			plus.storage.setItem(s, v);
		}
		$.removeItem = function(s) {
			plus.storage.removeItem(s);
		}
		$.clearItem = function() {
			plus.storage.clear();
		}

		$.objItem = {
			setobjItem: function(key, _obj) {
				$.setItem(key, JSON.stringify(_obj));
			},
			getobjItem: function(key) {
				return JSON.parse($.getItem(key));
			}
		}

		$.login = function(secretonekey) { //使用私钥登录
			if(!secretonekey || secretonekey.length != 56) {
				return false
			};
			try {
				var keypair = StellarSdk.Keypair.fromSecret(secretonekey);
				var publicaddress = keypair.publicKey();
				if(!!publicaddress) {
					$.setItem("$sourcePublicKey", publicaddress); //存公钥
					return true;
				} else {
					return false;
				}
			} catch(e) {
				console.log(e);
				return false;
			}
		};

		$.isactive = function() { //帐号是否已激活
			var isactive = $.getItem("isactive");
			//console.log(isactive);
			if(!isactive) {
				mui.openWindow({
					url: 'active.html',
					id: 'active'
				});
			}
		};

		$.getsecretonekey = function(pointkey) {
			var s = $.getItem("$secretonekey");
			var p;
			p = pointkey;
			if(!p) {
				p = $.getItem("pointkey");
			}
			//
			var returntxt = "";
			if(!!sjcl) {
				try {
					returntxt = sjcl.decrypt(p, s);
				} catch(e) {
					console.log(e);
				}
			}
			return returntxt;
		};
		$.getsourcePublicKey = function() {
			return $.getItem("$sourcePublicKey");
		};
		$.getpointkey = function() {
			return $.getItem("pointkey");
		};

		$.loginout = function() {
			$.clearItem();
		};
		$.checkuser = function() { //验证用户信息，每一页进入时先验证！

			//console.log("正在验证...");
			$.isactive(); //验证帐户是否激活
			//console.log("验证完成");
			var gotologin = function() {
				mui.openWindow({
					url: 'login.html',
					id: 'login',
					waiting: {
						autoShow: true,
						title: '正在加载...'
					}
				});
			}
			var gotolock = function() {
				console.log("正在显示锁屏。。。");

				if($.getItem("showlock") == "1") { //判断避免重复创建锁屏页	
					//plus.webview.open('lock.html');
					mui.openWindow({
						url: 'lock.html',
						id: 'lock.html'
					});
				}
				$.setItem("showlock", "0");
			}

			var pointkey = $.getpointkey();
			if(!$.getsourcePublicKey()) { //不存在公钥直接返回登录页
				console.log("不存在公钥");
				gotologin();
				return false;
			} else if(!pointkey) { //不存在手势返回手势解锁页
				console.log("不存在手势，跳转手势验证...");
				gotolock();
				return false;
			};

			$.sourceSecretKey = $.getsecretonekey();

			document.addEventListener("pause", function() {
				document.removeEventListener("pause", {});
				//console.log("应用从前台切换到后台");
				var currentWebView = plus.webview.currentWebview();

				$.removeItem("pointkey"); //删除手势密码
				//$.setItem("intervaldata", "false"); //切换到后台后不再获取数据
				//$.iaccount.pricelist.isactive = false;

				//console.log(JSON.stringify());
				gotolock();
			}, false);

			document.addEventListener("resume", function() {
				//console.log("应用从后台切换到前台");
				//$.iaccount.pricelist.isactive = true;
			}, false);
		}

		/*我的资产*/
		$.iaccount = {
			//targerAsset:定义兑换价格标准，这里以bcny作为基准！！！
			server: new StellarSdk.Server($.apiaddress),
			sourcePublicKey: $.getsourcePublicKey(),
			targerAsset: new StellarSdk.Asset("BCNY", "GBCNYBHAAPDSU3UIHXXQTHYZVSBJBI4YUNWXMKJBCPDHTVYR75G6NFHD"),
			xrppath: {//定义XRP货币的转换路径
				'from': new StellarSdk.Asset('XRP', 'GBOXNWGBB7SG3NVIA7O25M7JIRSXQ4KKU3GYARJEFMQXSR3APF3KRI6S'),
				'path': [
					new StellarSdk.Asset('USDT', 'GBOXNWGBB7SG3NVIA7O25M7JIRSXQ4KKU3GYARJEFMQXSR3APF3KRI6S'),
					new StellarSdk.Asset.native(),
					new StellarSdk.Asset("BCNY", "GBCNYBHAAPDSU3UIHXXQTHYZVSBJBI4YUNWXMKJBCPDHTVYR75G6NFHD")
				]
			},
			getaccount: function() {
				var dtd = $.Deferred();
				this.server.loadAccount(this.sourcePublicKey)
					.catch(function(e) {
						console.error(JSON.stringify(e));
					})
					.then(function(account) {
						dtd.resolve(account);
					});
				return dtd.promise();
			},
			getbalance: function() {
				var dtd = $.Deferred();
				var defer = $.Deferred(); //循环用到的异步
				defer.resolve();
				var obj_get = [];
				this.getaccount().then(function(account) {

					var balances = account.balances;

					//这里先排序，后面按顺序获取
					var XLM = [];
					$.each(balances, function(index, value) {
						if(value.asset_type == "native") {
							XLM = balances.splice(index, 1); //从数组中移除xlm后面再插在首位
						}
					});

					balances = balances.sort(compare('asset_code')); //先按首字母排序
					balances.unshift(XLM[0]);

					$.each(balances, function(index, value) {

						var obj_price = {};
						if(value.asset_type == "native") { //
							obj_price.code = "XLM";
							obj_price.balance = value.balance;
							obj_price.website = "Stellar Network";
							//obj_price.price = "1.0000000";
							obj_price.issuer = "";
							obj_price.image = "assets/XLM/XLM.png";
							obj_price.type = "native";
							obj_get.push(obj_price);
						}
						/*}else if(value.asset_code==bcny.code, value.asset_issuer==bcny.issuer){
							
						}*/ else {

							defer = defer.then(function() {

								var ddd = $.Deferred();
								$.iaccount.getimgbyasset(value.asset_code, value.asset_issuer)
									.catch(function(e) {
										console.error(JSON.stringify(e));
									})
									.then(function(img_obj) {
										//console.log("获取资产中");

										obj_price.balance = value.balance;
										obj_price.code = value.asset_code;
										obj_price.issuer = value.asset_issuer;
										obj_price.website = img_obj.website;
										obj_price.image = img_obj.image;
										//obj_price.price = 0;
										//console.log(JSON.stringify(value.asset_code));
										obj_get.push(obj_price);
										ddd.resolve();
									})
								return ddd.promise();
							});
						}
					});

					defer.then(function() {
						//console.log(JSON.stringify(obj_get));
						dtd.resolve(obj_get);
					})

				});

				return dtd.promise();
			},
			getbuyandsell: function(selfasset, asset){ //获取买价和卖价，asset为目标货币，为空则为XLM
				var dtd = $.Deferred();
				var targetasset = !!asset ? asset : new StellarSdk.Asset.native();
				this.server.orderbook(targetasset, selfasset)
					.call()
					.catch(function(e) {
						console.log(JSON.stringify(e));
					})
					.then(function(resp) {
						
						var _obj = {};
						if(resp.asks.length != 0 && resp.bids.length != 0) {//买价和卖价同时存在
						
							_obj.bids = parseFloat(resp.bids[0].price).toFixed(7);
							_obj.asks = parseFloat(resp.asks[0].price).toFixed(7);
						}
						dtd.resolve(_obj);
					});
				return dtd.promise();
			},
			getprice: function(selfasset, asset) { //asset为目标货币，为空则为XLM						
				var dtd = $.Deferred();
				this.getbuyandsell(selfasset, asset).then(function(rex){
					var aveprice = 0;
					if(JSON.stringify(rex)!="{}"){
						aveprice = (parseFloat(rex.bids) / 2 + parseFloat(rex.asks) / 2).toFixed(7);
					}
					dtd.resolve(aveprice);
				});
				return dtd.promise();
			},
			getpriceTarget: function(selfasset){//以某种货币为基准计算价格，这里以bcny为基准
				var dtd = $.Deferred();
				var targerAsset = this.targerAsset;		
				var ts = this;
				if(selfasset.code==this.targerAsset.code && selfasset.issuer==this.targerAsset.issuer){
					dtd.resolve("1.0000000");//基准货币bcny的价格定为1
				}else if(selfasset.code==this.xrppath.from.code && selfasset.issuer==this.xrppath.from.issuer){
					//XRP货币使用特殊路径计算价格
					var ts = this;
					var path1 = this.getprice(selfasset,ts.xrppath.path[0]);
					var path2 = this.getprice(ts.xrppath.path[0],ts.xrppath.path[1]);
					var path3 = this.getprice(ts.xrppath.path[1],ts.xrppath.path[2]);
					$.when(path1,path2,path3).then(function(a,b,c){
						dtd.resolve((parseFloat(a)*parseFloat(b)*parseFloat(c)).toFixed(7));
					})
				}
				else{
				this.getbuyandsell(selfasset, targerAsset).then(function(rex){
					//买卖价格相差小于10%直接兑换
					if(JSON.stringify(rex)!="{}" && parseFloat(rex.asks)/parseFloat(rex.bids) < 1.10){
						var aveprice = (parseFloat(rex.bids) / 2 + parseFloat(rex.asks) / 2).toFixed(7);
						dtd.resolve(aveprice);
					}else{
						$.when(ts.getprice(selfasset),ts.getprice(new StellarSdk.Asset.native(),targerAsset))
						.then(function(a,b){
							var aveprice = (parseFloat(a)*parseFloat(b)).toFixed(7);
							dtd.resolve(aveprice);
						})
					}
					
				});
				}
				return dtd.promise();
			},
			getpricelist: function() {
				//console.log("获取数据中...");
				var dtd = $.Deferred();
				var returnlist = [];
				$.when(this.getbalance()).then(function(balancelist) {
					$.each(balancelist, function(i, v) {
						if(v.code == "XLM") {
							returnlist.push(v);
							return true;
						}

						$.iaccount.getprice(v.code, v.issuer).then(function(aveprice) {
							var nlist = $.extend({}, v, {
								"price": aveprice
							});
							returnlist.push(nlist);

							if(i + 1 >= balancelist.length) {

								dtd.resolve(returnlist);
							}
						});

					});
				}).catch(function(e) {
					console.log(JSON.stringify(e));
				})

				return dtd.promise();
			},
			pathprice: function(code, issuer, asset) { //asset为中间货币
				var ts = this;
				var dtd = $.Deferred()
				ts.getprice(code, issuer, asset).then(function(rexp) {
					//console.log(rexp);
					ts.getprice(asset.code, asset.issuer).then(function(rexp2) {
						//console.log('第二次价格是');
						//console.log(rexp2);
						dtd.resolve((parseFloat(rexp2) * parseFloat(rexp)).toFixed(7));
					})
				}).catch(function(e) {
					console.log(JSON.stringify(e));
				});
				return dtd.promise();
			},
			//			pricelist: {//以前的方法，已不用
			//				get: function(callback) { //请求返回价格，需请求多次
			//					var server = new StellarSdk.Server($.apiaddress);
			//					var sourcePublicKey = $.getsourcePublicKey();
			//
			//					server.loadAccount(sourcePublicKey) //请求返回资产
			//						.catch(function(e) {
			//							//console.log(JSON.stringify(e));
			//							console.error(e);
			//						})
			//						.then(function(account) {
			//							if(!account) {
			//								return false;
			//							}
			//
			//							obj_get = {};
			//							obj_get.data = [];
			//							//console.log(account);
			//
			//							var balances_arr = account.balances;
			//							var k = 1;
			//
			//							$.each(balances_arr, function(index, value) { //循环请求，返回每一项
			//								k++;
			//								var obj_price = {};
			//								if(value.asset_type == "native") { //XCN								
			//									obj_price.code = "XLM";
			//									obj_price.balance = value.balance;
			//									obj_price.website = "Stellar Network";
			//									obj_price.price = "1.0000000";
			//									obj_price.issuer = "";
			//									obj_price.image = "assets/XLM/XLM.png";
			//									obj_price.type = "native";
			//									obj_get.data.push(obj_price);
			//								} else {
			//
			//									var dtd = $.Deferred();
			//
			//									$.when()
			//										.then(function() {
			//											var sss = $.iaccount.getimgbyasset(value.asset_code, value.asset_issuer);
			//											if(sss) return sss;
			//										})
			//										.then(function(img_obj) {
			//											obj_price.balance = value.balance;
			//											obj_price.code = value.asset_code;
			//											obj_price.issuer = value.asset_issuer;
			//											obj_price.website = img_obj.website;
			//											obj_price.image = img_obj.image;
			//
			//											obj_get.data.push(obj_price);
			//
			//											if(k >= balances_arr.length) {
			//
			//												//console.log(obj_get);
			//												//全部返回了再进行排序
			//												obj_get.data = obj_get.data.sort(compare('code')); //先按首字母排序
			//
			//												$.each(obj_get.data, function(index, value) {
			//													if(value.code == "XLM") {
			//														var str = obj_get.data.splice(index, 1);
			//														obj_get.data.unshift(str[0]); //删除再在开头插入native
			//														return false;
			//													}
			//												});
			//												//obj_get.account = account;
			//												//console.log(JSON.stringify(obj_get));
			//												callback(obj_get, account);
			//
			//											}
			//
			//										})
			//
			//								}
			//
			//							});
			//
			//						});
			//				},
			//				isactive: true,
			//				setall: function() {
			//					if($.iaccount.pricelist.isactive) {
			//						$.iaccount.pricelist.get(function(_obj) {
			//							$.objItem.setobjItem("alldata", _obj);
			//							//console.log("正在获取数据...");
			//							setTimeout($.iaccount.pricelist.setall, 8000);
			//						});
			//
			//					} else {
			//						setTimeout($.iaccount.pricelist.setall, 8000);
			//					}
			//
			//				},
			//				getall: function() {
			//					return $.objItem.getobjItem("alldata") || {};
			//				}
			//
			//			},
			getbalancebyasset: function(asset, accountlist) { //通过asset取得资产方法
				var _balance = 0;
				$.each(accountlist, function(index, value) {
					if((asset.code == value.code && asset.issuer == value.issuer) || (asset.code == "XLM" && value.code == "XLM")) {
						_balance = value.balance;
						return false;
					}
				});
				return _balance;
			},
			getimgbyasset: function(code, issuer, type) {
				var _source = gateways.getSourceById(issuer); //从gateways.js获取图标和域名信息
				var dtd = $.Deferred();

				var img_obj = {};
				if(type == 'native') {
					img_obj.image = "assets/XLM/XLM.png";
					img_obj.website = "Stellar Network";
				} else {
					$.each(_source.assets, function(index, value) {
						if(index == code && !!value.image) {
							img_obj.image = value.image;
							img_obj.website = _source.name.replace("https://", "");
						}
					});
				}

				//console.log(JSON.stringify(img_obj));
				//如果货币在gateways找不到
				if(!img_obj.image) {

					var objitem = $.objItem.getobjItem(code + "," + issuer);

					if(objitem != null && JSON.stringify(objitem) != "{}") {
						//console.log(objitem);
						img_obj.image = objitem.image;
						img_obj.website = objitem.website.replace("https://", "");
						dtd.resolve(img_obj);
					} else {
						//console.log("从网络");

						$.iaccount.getimgfromnetwork(code, issuer)
							.then(function(_data) {
								$.objItem.setobjItem(code + "," + issuer, _data);
								img_obj.image = _data.image;
								img_obj.website = _data.website.replace("https://", "");
								//console.log(JSON.stringify(img_obj));
								dtd.resolve(img_obj);
							}).catch(function(e) {
								console.log(code);
								console.error(e);
							});
					}

				} else {
					dtd.resolve(img_obj);
				}
				return dtd.promise();
			},
			getimgfromnetwork: function(code, issuer) {

				var dtd = $.Deferred();
				$.get($.apiaddress + "/assets?asset_code=" + code + "&asset_issuer=" + issuer)
					.then(function(rs) {
						return rs._embedded.records[0]._links.toml.href;
					})
					.then(function(tomlurl) {
						$.get(tomlurl)
							.then(function(rs) {
								var tomlrs;
								try {
									tomlrs = toml.parse(rs);
								} catch(e) {

								}

								if(tomlrs) {
									var _obj = {};
									$.each(tomlrs.CURRENCIES, function(index, value) {
										if(value.code == code && value.issuer == issuer) {
											_obj.image = value.image;
											_obj.website = value.host;
										}
									});
									//console.log(JSON.stringify(_obj));
									dtd.resolve(_obj);
								}
							})
					})
					.catch(function(e) {
						console.log(code);
						console.log(issuer);
						console.error(JSON.stringify(e));
					});

				return dtd.promise();

			}
		}

		$.toml = {
			getbydomain: function(domain) {
				var posturl = "https://" + domain + "/.well-known/stellar.toml";
				$.get(posturl, function(result) { //解析toml文件
					var config = toml.parse(result);
					//console.log(JSON.stringify(config));
				});
			}
		}

		$.defaultpricelist = [{ //定义默认强行显示的货币************测试数据，待更新
				code: "BCNY",
				image: "assets/bitbox.one/bcny.png",
				issuer: "GBCNYBHAAPDSU3UIHXXQTHYZVSBJBI4YUNWXMKJBCPDHTVYR75G6NFHD",
				name: "BCNY",
				website: "bitbox.one",
				isactive: "-1"
			},
			{
				code: "USDT",
				image: "assets/bitbox.one/usdt.png",
				issuer: "GBOXNWGBB7SG3NVIA7O25M7JIRSXQ4KKU3GYARJEFMQXSR3APF3KRI6S",
				name: "USDT",
				website: "bitbox.one",
				isactive: "-1"
			},
			{
				code: "XRP",
				image: "assets/bitbox.one/xrp.png",
				issuer: "GBOXNWGBB7SG3NVIA7O25M7JIRSXQ4KKU3GYARJEFMQXSR3APF3KRI6S",
				name: "XRP",
				website: "bitbox.one",
				isactive: "-1"
			},
			{
				code: "SDA",
				image: "assets/bitbox.one/sda.jpg",
				issuer: "GBOXNWGBB7SG3NVIA7O25M7JIRSXQ4KKU3GYARJEFMQXSR3APF3KRI6S",
				name: "SDA",
				website: "bitbox.one",
				isactive: "-1"
			}
		];

		$.timecheck = function() {
			if(new Date().getTime() - $.requesttime < 5000) {
				//mui.toast('你点击太快了！请等待5秒钟！');
				return true;
			}
			$.requesttime = new Date().getTime();
		}

		$.appinit = function() {

		}

	});

})(jQuery);

mui.plusReady(function() {

	$("body").on("tap", ".loginout", function() { //通用注销

		var btnArray = ['否', '是'];
		mui.confirm('您确定退出?', '', btnArray, function(e) {
			if(e.index == 1) {
				$.loginout();

				// 获取所有Webview窗口
				var curr = plus.webview.currentWebview();
				var wvs = plus.webview.all();

				for(var i = 0, len = wvs.length; i < len; i++) {
					//关闭除当前页面外的其他页面
					if(wvs[i].getURL() == curr.getURL() || wvs[i].id == 'main.html')
						continue;
					//console.log(JSON.stringify(wvs[i].id));
					try {
						plus.webview.close(wvs[i]);
					} catch(e) {
						console.error(e);
					}

				}

				//打开login页面后再关闭setting页面
				console.log("退出，正在跳转登录页。。。");
				plus.webview.open('login.html');
				curr.close();

			}
		})

	});

	$("body").on("tap", ".reload", function() {
		location.reload();
		/*mui.plusReady(function(){
		plus.vebview.active.reload();
		});*/
	});

});
/*
function wainshow() {
	
    if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
        //mui.toast("网络异常，请检查网络设置！");
        mui.alert('网络异常，请检查网络设置！', '提示', function() {
			location.reload();
		});

    } else {
        
    }
}*/

$(document).ready(function() {

	//$.appinit();

	$("body").on("tap", "a", function() {
		var href = $(this).attr("_href");
		var single = $(this).attr("data-single");
		var keepfooter = $(this).attr("data-keepfooter");
		keepfooter == "true" ? bottomnum = "55px" : bottomnum = "0px";
		if(href) {
			mui.openWindow({
				url: href,
				show: {
					aniShow: 'pop-in'
				},
				waiting: {
					autoShow: true,
					title: '正在加载...'
				},
				styles: {
					top: '0px',
					bottom: keepfooter
				}
			});
			if(single == "true") {
				//mui.back();
				plus.webview.currentWebview().close();
			}
		}

	});

});