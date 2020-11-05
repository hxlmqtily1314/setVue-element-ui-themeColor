# vue+element-ui动态设置主题色

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```
## 基本思路
- 1.把得到的主题色传递给根root实例，在根实例中监听主题色的变化，并调用`setThemeColor(newval, oldval)`方法；
- 2.在APP.vue中监听路由变化，并调用`setThemeColor(newval, oldval)`方法，目的是进入具体路由页面需要修改页面的head中的style样式、DOM元素中的行内style样式；


## 使用方式
### 设置element-ui主题色引入到main.js中

在src/styles下新建`element-variables.scss`:
```
/* 改变主题色变量 */
$--color-primary: #42b983;

/* 改变 icon 字体路径变量，必需 */
$--font-path: '~element-ui/lib/theme-chalk/fonts';

@import "~element-ui/packages/theme-chalk/src/index";

:export {
  colorPrimary: $--color-primary
}
```
在main.js中引入该css:
```
import variables from '@/styles/element-variables.scss'
```

### 全局混入theme.js、emitter.js
- theme.js主要方法`setThemeColor(newval, oldval)`,该方法传入新的颜色值与旧的颜色值;
- emitter.js中使用`$$dispatch`方法把修改的主题色提交到根实例下;

在main.js 中引入该两个JS并注册：
```
import theme from '@/mixins/theme.js'
import emitter from '@/mixins/emitter.js'

Vue.mixin(theme)
Vue.mixin(emitter)
```
### 核心代码调用
- 主题色提交到根实例代码以及监听具体的路由页面修改样式
```
export default {
  name: 'App',
  inject: {
    themeConfig: {
      default: () => ({
        themeColor: '',
        defaultColor: ''
      })
    }
  },
  data() {
    return {
      themeColor: ''
    }
  },
  watch: {
    $route() {
      // 关键作用-进入到具体路由页面更新页面中DOM样式
      if (typeof this.themeConfig.themeColor != 'undefined' && this.themeConfig.themeColor !== this.themeConfig.defaultColor) {
        this.$nextTick(() => {
          if (this.themeConfig.themeColor && this.themeConfig.defaultColor) {
            this.setThemeColor(this.themeConfig.themeColor, this.themeConfig.defaultColor)
          }
        })
      }
    }
  },
  created() {
    // 如果本地存在主题色从本地获取，并提交给root分发到页面进行渲染
    if(Cookies.get('themeColor')) {
      this.themeColor = Cookies.get('themeColor');
      this.$$dispatch('root','root.config',this.themeColor);
    } else {
      this.themeColor = this.themeConfig.themeColor;
    }
  },
  methods: {
    // 改变主题颜色
    changeThemeColor(value) {
      this.$$dispatch('root','root.config',value);
      Cookies.set('themeColor', value, { path: '/' });
    }
  }
}
```
- 根实例监听获取的主题色并监听设置主题色
```
new Vue({
  el: '#app',
  name: 'root',
  provide(){
    return {
      themeConfig: this
    }
  },
  data() {
    return {
      themeColor: variables.colorPrimary,
      defaultColor: variables.colorPrimary
    }
  },
  created() {
    this.$on('root.config',(result) => {
      this.themeColor = result;
    })
  },
  watch: {
    themeColor(newval, oldval) {
      this.setThemeColor(newval, oldval);
    }
  },
  router,
  components: { App },
  template: '<App/>'
})
```


### theme.js设置主题代码
```
export default {
  methods: {
    // 样式更新
    updateStyle(stylecon, oldCulster, newCluster) {
      let newStyleCon = stylecon;
      oldCulster.forEach((color, index) => {
        if (color.split(',').length > 1) {
          const rgbArr = color.split(',');
          const regexp = new RegExp("\\s*" + rgbArr[0] + "\\s*,\\s*" + rgbArr[1] + "\\s*,\\s*" + rgbArr[2] + "\\s*",
            'ig');
          newStyleCon = newStyleCon.replace(regexp, newCluster[index])
        } else {
          newStyleCon = newStyleCon.replace(new RegExp(color, 'ig'), newCluster[index])
        }

      })
      return newStyleCon;
    },

    // 得到需要修改的一系类颜色值
    getThemeCluster(theme) {
      const clusters = [theme];
      for (let i = 0; i <= 9; i++) {
        clusters.push(this.getTintColor(theme, Number(i / 10).toFixed(2)));
      }
      clusters.push(this.getShadeColor(theme, 0.1));
      return clusters;
    },

    // 得到色调颜色
    getTintColor(color, tint) {
      let red = parseInt(color.slice(0, 2), 16);
      let green = parseInt(color.slice(2, 4), 16);
      let blue = parseInt(color.slice(4, 6), 16);

      if (tint == 0) {
        return [red, green, blue].join(',');
      } else {
        red += Math.round((255 - red) * tint);
        green += Math.round((255 - green) * tint);
        blue += Math.round((255 - blue) * tint);
        red = red.toString(16);
        green = green.toString(16);
        blue = blue.toString(16);
        return `#${red}${green}${blue}`
      }
    },

    // 获取阴影色调颜色
    getShadeColor(color, shade) {
      let red = parseInt(color.slice(0, 2), 16);
      let green = parseInt(color.slice(2, 4), 16);
      let blue = parseInt(color.slice(4, 6), 16);

      red = Math.round((1 - shade) * red);
      green = Math.round((1 - shade) * green);
      blue = Math.round((1 - blue) * blue);

      red = red.toString(16);
      green = green.toString(16);
      blue = blue.toString(16);
      return `#${red}${green}${blue}`
    },

    // 获取外链css文本内容
    getCSSText(url, callback) {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const styleText = xhr.responseText.replace(/@font-face{[^}]+}/, '')
          callback(styleText);
        }
      }
      xhr.open('GET', url)
      xhr.send()
    },


    // 获取外链CSS样式的url地址
    getRequestUrl: function(src) {
      if (/^(http|https):\/\//g.test(src)) {
        return src;
      }
      let filePath = this.getFilePath();
      let count = 0;
      const regexp = /\.\.\//g;
      while (regexp.exec(filePath)) {
        count++;
      }
      while (count--) {
        filePath = filePath.substring(0, filePath.lastIndexOf('/'));
      }
      return filePath + "/" + src.replace(/\.\.\//g, "");
    },

    // 获取当前window的url地址
    getFilePath: function() {
      const curHref = window.location.href;
      if(curHref.indexOf('/#/') != -1) {
        return curHref.substring(0, curHref.indexOf('/#/'));
      } else {
        return curHref.substring(0, curHref.lastIndexOf('/') + 1);
      }
    },

    // 修改主题色-head样式以及DOM行内样式
    setThemeColor(newval, oldval) {
      if (typeof newval !== 'string') return;
      const newThemeCluster = this.getThemeCluster(newval.replace('#', ''));
      const orignalCluster = this.getThemeCluster(oldval.replace('#', ''));
      // 获取原始值中包含rgb格式的值存为数组
      const rgbArr = orignalCluster[1].split(',');
      const orignalRGBRegExp = new RegExp("\\(\\s*" + rgbArr[0] + "\\s*,\\s*" + rgbArr[1] + "\\s*,\\s*" + rgbArr[2] +
        "\\s*\\)", 'i');

      // 获取外链的样式内容并替换样式
      let styleTag = document.getElementById('new-configTheme__styles');
      const tagsDom = document.getElementsByTagName('link');
      if (!styleTag && tagsDom) {
        styleTag = document.createElement('style')
        styleTag.setAttribute('id', 'new-configTheme__styles')
        document.head.appendChild(styleTag);
        const tagsDomList = Array.prototype.slice.call(tagsDom);
        tagsDomList.forEach((value, index, array) => {
          const tagAttributeSrc = value.getAttribute('href');
          const requestUrl = this.getRequestUrl(tagAttributeSrc);
          this.getCSSText(requestUrl, (styleCon) => {
            if(new RegExp(oldval, 'i').test(styleCon) || orignalRGBRegExp.test(styleCon)) {
              styleTag.innerText += this.updateStyle(styleCon,orignalCluster,newThemeCluster);
            }
          })
        })
      }

      // 获取页面的style标签
      const styles = [].slice.call(document.querySelectorAll('style')).filter((style) => {
        const text = style.innerText;
        return new RegExp(oldval, 'i').test(text) || orignalRGBRegExp.test(text);
      })
      styles.forEach((style) => {
        const {
          innerText
        } = style;
        if (typeof innerText !== 'string') return;
        style.innerText = this.updateStyle(innerText, orignalCluster, newThemeCluster);
      })

      // 获取DOM元素上的style
      const domAll = [].slice.call(document.getElementsByTagName('*')).filter((dom, index) => {
        const stylCon = dom.getAttribute('style');
        return stylCon && (new RegExp(oldval, 'i').test(stylCon) || orignalRGBRegExp.test(stylCon))
      })
      domAll.forEach((dom) => {
        const styleCon = dom.getAttribute('style');
        dom.style = this.updateStyle(styleCon, orignalCluster, newThemeCluster);
      })
    }
  }
}

```
### emitter代码
```
function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
        var name = child.$options.name;

        if (name === componentName) {
            child.$emit.apply(child, [eventName].concat(params));
        } else {
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}

function dispatch(componentName, eventName, params) {
    var parent = this.$parent || this.$root;
    var name = parent.$options.name;

    while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
            name = parent.$options.name;
        }
    }
    if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
    }
}

export default {
    methods: {
        $$dispatch(componentName, eventName, params) {
           dispatch.call(this, componentName, eventName, params)
        },
        $$broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        }
    }
};
```
