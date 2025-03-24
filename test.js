class Container {
    constructor() {
      this.dependencies = new Map();
      this.instances = new Map();
    }
  
    register(name, dependency, isSingleton = false) {
      this.dependencies.set(name, { dependency, isSingleton });
    }
  
    resolve(name) {
      const dep = this.dependencies.get(name);
  
      if (!dep) {
        throw new Error(`未注册的依赖: ${name}`);
      }
  
      if (dep.isSingleton) {
        if (!this.instances.has(name)) {
          this.instances.set(name, this.createInstance(dep.dependency));
        }
        return this.instances.get(name);
      }
  
      return this.createInstance(dep.dependency);
    }
  
    createInstance(Class) {
      const params = this.getDependencies(Class);
      return new Class(...params);
    }
  
    getDependencies(Class) {
      const paramTypes = Reflect.getMetadata('design:paramtypes', Class) || [];
      return paramTypes.map(type => this.resolve(type.name));
    }
  }
  
  // 使用装饰器注入元数据（需要安装reflect-metadata）
  require('reflect-metadata');
  
  // 示例服务类
  class Database {
    constructor() {
      this.url = 'mysql://localhost:3306/mydb';
    }
  }
  
  class UserService {
    constructor(database, config = { env: 'dev' }) {
      this.database = database;
      this.config = config;
    }
  }
  
  // 注册依赖： midway框架里是通过@provide装饰器实现的
  const container = new Container();
  container.register('Database', Database, true); // 单例
  container.register('UserService', UserService);
  
  // 解析使用: 通过类名动态获取实例
  // midway框架里是通过 await ctx.requestContext.getAsync(UserService);
  const userService = container.resolve('UserService');
  console.log(userService.database.url); // 输出: mysql://localhost:3306/mydb
  