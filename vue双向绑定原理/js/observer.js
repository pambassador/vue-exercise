//实现一个监听器，用来劫持监听所有属性，若有变动，就通知订阅者
function Observer(data){
	this.data = data;
	this.walk(data);
}

Observer.prototype = {
	// 对所有属性监听，利用递归来遍历所有的属性值，对其进行Object.defineProperty()操作：
	walk: function(data){
		var self = this;
		Object.keys(data).forEach(function(key){
			self.defineReactive(data, key, data[key]);
		});
	},
	defineReactive: function(data, key, val){
		var dep = new Dep();
		var childObj = observer(val);
		Object.defineProperty(data, key, {
			enumerable:true,
			configurable:true,
			get: function getter(){
				if(Dep.target){
					dep.addSub(Dep.target);  //在这里添加一个订阅者
				}
				return val;
			},
			set: function setter(newVal){
				if(newVal === val){
					return;
				}
				val = newVal;
				dep.notify(); //如果数据变化，通知所有订阅者
			}
		})
	}
}

function observer(value, vm){
	if(!value || typeof value!=='object'){
		return;
	}
	return new Observer(value);
}

function Dep(){               //创建一个可以容纳订阅者的消息订阅器
	this.subs = [];	
}

Dep.prototype = {                 
	addSub: function(sub){      ///添加订阅者
		this.subs.push(sub);
	},
	notify: function(){         //通知订阅者
		this.subs.forEach(function(sub){
			sub.update();
		});
	}
}

Dep.target = null;