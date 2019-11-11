(function(){
	uploadModule = function(options) {
			var self = this;
			
			var fileElement = options.fileElement;
			var uploadBtn = options.uploadBtn;
			//默认多选，可手动设置 multiple=false 来关闭多选
			if(!options.multiple){
				$(fileElement).removeAttr("multiple");
			}
			
			//取消按钮，用于清空file
			var cancelBtn = options.cancelBtn;
			
			// 选中的文本附件（上传之前）展示列表 $("selectAttachList")
			var selectedAttachList = options.selectedAttachList; 
			
			// "/oa-web/api/sysAttachment/uploadAndGetUploadInfo";
			var url = options.url; 
			
			//模态弹窗 用于成功或者失败后的显示或者隐藏
			var modalDialog = options.modalDialog; 
			
			//进度条 $("#son");
			var processBar = options.processBar;
			
			//angular Controller 所在节点,用于取得scope，上传成功后及时更新已经上传的附件列表 $("div[ng-controller='userCtl']")
			var controllerElement = options.controllerElement;
			
			//上传完成的附件列表，用来处理图标，（此处由于上传的文件无法触发emit事件，所以这里相当于打补丁） $("label[zw-attachment]") 
			var uploadedAttachList = options.uploadedAttachList;
			
			//angular 的已经上传的附件的model
			var attachModel = options.attachModel;
			
			//回调方法
			var callback = options.func;
			
			//回调方法的参数，多个参数请以Object形式传递
			var callbackParam = options.funcParam;
			
			var __upload_file_array__ = [];
			//用来替换file的容器，解决选中相同的文件，change事件不再触发的问题
			var newFile ;
			return {
				showSelectTag: function(){	
						var that = this;
						//初始化
						$(selectedAttachList).html("");
						__upload_file_array__.length = 0;
						
						//取得选中文件
						var files = fileElement[0].files;
						//复制数组
						Array.prototype.push.apply(__upload_file_array__,files);
						//移除首部undefined
						if(!__upload_file_array__[0]){
							__upload_file_array__.shift()
						}
						for(var i in files){
							if(files[i] instanceof File){
								$(selectedAttachList).append("<li>"+files[i].name+"<a href='#' class='icon-remove modal_upload_icon' type='button' data-num='"+i+"'></a></li>")
							}
						}
						//绑定移除图标事件
						$("[data-num]").each(function(i,e){
							$(e).unbind("click").click(function(){
								that.removeTag($(e),$(e).attr("data-num"));
							})
						})
						
					},
					removeTag : function (self,k){
						console.log(__upload_file_array__);
						delete __upload_file_array__[k];
						$(self).parent().remove();
						console.log(__upload_file_array__);
					},
					upload : function(){
						var that = this;
						var formData = new FormData();
						for(var j=0;j<__upload_file_array__.length;j++){
							formData.append("file",__upload_file_array__[j]);
						}
						
						/**   
						   * 必须false才会避开jQuery对 formdata 的默认处理   
						   * XMLHttpRequest会对 formdata 进行正确的处理   
						   */  
						$.ajax({  
							   type: "POST",  
							   url : url,  
							   data: formData ,  
							   processData : false,   
							   //必须false才会自动加上正确的Content-Type   
							   contentType : false ,   
							   xhr: function(){  
								   var xhr = $.ajaxSettings.xhr();  
								   if(that.onprogress && xhr.upload) {  
										xhr.upload.addEventListener("progress" , that.onprogress, false);  
										return xhr;  
								   }  
							   },
							   success : function(data){
								   //处理回文数据
								   if(attachModel){
									   that.processResult(data.data);
								   }
									ZW.Model.info("上传成功","确认",function(){
										
										__upload_file_array__.length=0;
										
										$(modalDialog).modal("hide");
										//清空 
										$(selectedAttachList).html("");
										$(processBar).html("0%" );  
										$(processBar).css("width" , "0%");
										
										//替换file标签，第二次选中第一次已经上传的文件时，change事件不触发的bug
										$(fileElement).replaceWith(newFile);
										//以下为new file 绑定change事件
										that.bindShowTagEvent();
										
										if(callback && typeof(callback)=="function"){
											callback.call(this,callbackParam,data);
										}
									});
							   },
							   error : function(data){
								   ZW.Model.info("上传失败","确认",function(){
										__upload_file_array__.length=0;
										//清空选中
										$(selectedAttachList).html("");
										$(modalDialog).modal("hide");
										//清空进度条
										$(processBar).html("0%");  
										$(processBar).css("width" , "0%");
									});
							   }
						  }); 
					},
					/**  
					  * 侦查附件上传情况 ,这个方法大概0.05-0.1秒执行一次  
					  */  
					onprogress : function(evt){  
						  var loaded = evt.loaded;     //已经上传大小情况   
						  var tot = evt.total;      //附件总大小   
						  var per = Math.floor((100 * loaded) / tot);  //已经上传的百分比   
						  $(processBar).html( per +"%" );  
						  $(processBar).css("width" , per +"%");  
					},
			
					//将已经上传的附件展示到附件列表中
					processResult : function (data){
						if(!controllerElement){
							//不存在时候表明为非angular
							//TODO 扩展非angular回显，以dom形式拼接li，需要时候再开发
							return;
						}
						//通过DOM操作获取app对象
						var $scope = angular.element($(controllerElement)).scope(); 
						
						for(var i in data){
							data[i].$$hashKey = data[i].pkid;
							$scope[attachModel].push(data[i]);
						}
						$scope.$apply(); 
						this.addIconClass();
					},
			
					//单独处理图标样式
					addIconClass : function () {
						var iconMapper = {
								".pdf"    : "form_type_icon_pdf",
								".img"    : "form_type_icon_img",
								".png"    : "form_type_icon_img",
								".jpeg"    : "form_type_icon_img",
								".office" : "form_type_icon_office" 
						} 
						var iElement = $(uploadedAttachList).children().find("i");
						$(iElement).each(function(i,e){
							var type = $(e).attr("data-type");
							var style = iconMapper[type] ? iconMapper[type] : "form_type_icon_others";
							$(e).addClass(style);
						})
					},
					
					//绑定事件
					bindShowTagEvent : function(){
						var that = this;
						$(fileElement).unbind("change").bind("change",function(){
							newFile = $(this).clone(true);//.replaceAll(newFile=this);
							that.showSelectTag();
						});
					},
					
					//绑定上传事件
					bindUploadEvent : function(){
						var that = this;
						$(uploadBtn).unbind("click").click(function(){
							that.upload();
						});
					},
					
					//绑定取消事件
					bindCancelEvent : function(){
						var that = this;
						$(cancelBtn).unbind("click").click(function(){
							if(newFile){
								//清空 
								$(selectedAttachList).html("");
								$(processBar).html("0%" );  
								$(processBar).css("width" , "0%");
								$(fileElement).replaceWith(newFile);
							}
						});
					}
			}
	}
})()