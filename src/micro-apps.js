const getActiveRule = (hash) => (location) => location.hash.startsWith(hash);
import {registerMicroApps, start} from "qiankun";

/**
 * 微应用配置中心
 * 定义所有子应用的名称、入口地址、挂载容器以及激活规则。
 */

registerMicroApps([
  {
    name: "vue-app",
    entry: "//localhost:8082",
    container: "#micro-viewport", // 统一挂载点
    activeRule: getActiveRule("#/dashboard/micro-vue"), // 只要路径以这个开头，就激活
  },
  {
    name: "react-app",
    entry: "//localhost:8083",
    container: "#micro-viewport",
    activeRule: "/dashboard/micro-react",
  },
]);
start({
  prefetch: true,
});
