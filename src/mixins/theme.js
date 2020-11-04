export default {
  inject: {
    themeConfig: {
      default: () => ({
        themeColor: '',
        defaultColor: ''
      })
    }
  },
  watch: {
    'themeConfig.themeColor': function(newval, oldval) {
      this.setThemeColor(newval, oldval);
    },
    '$route': function(val, oldval) {
      if (typeof this.themeConfig.themeColor != 'undefined' && this.themeConfig.themeColor !== this.themeConfig.defaultColor) {
        this.$nextTick(() => {
          if (this.themeConfig.themeColor && this.themeConfig.defaultColor) {
            this.setThemeColor(this.themeConfig.themeColor, this.themeConfig.defaultColor)
          }
        })
      }
    }
  },

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


    // 获取url地址
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

    getFilePath: function() {
      const curHref = window.location.href;
      if(curHref.indexOf('/#/') != -1) {
        return curHref.substring(0, curHref.indexOf('/#/'));
      } else {
        return curHref.substring(0, curHref.lastIndexOf('/') + 1);
      }
      return curHref.substring(0, curHref.lastIndexOf('/') + 1);
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
