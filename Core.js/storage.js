const __VERSION__ = 2;
class Cache {
  constructor(key) {
    this.KEY = key;
  }
  get() {
    return $cache.get(this.KEY);
  }
  set(value) {
    return $cache.set(this.KEY, value);
  }
}
class File {
  constructor(icloud) {
    this.IS_ICLOUD = icloud ?? false;
  }
  setIsIcloud(is_icloud) {
    this.IS_ICLOUD = is_icloud === true;
  }
  open(handler, types) {
    $drive.open({
      handler: handler,
      types: types
    });
  }
  save(name, data, handler) {
    $drive.save({
      data: data,
      name: name,
      handler: handler
    });
  }
  isDirectory(path) {
    if (!this.isExists(path)) {
      return false;
    }
    return this.IS_ICLOUD ? $drive.isDirectory(path) : $file.isDirectory(path);
  }
  isExists(path) {
    return path && this.IS_ICLOUD ? $drive.exists(path) : $file.exists(path);
  }
  ifFile(path) {
    return !$file.isDirectory(path);
  }
  getFileList(dir, ext = undefined) {
    if ($file.exists(dir) && $file.isDirectory(dir)) {
      let files = [];
      const fileList = $file.list(dir);
      fileList.map(f => {
        if (!$file.isDirectory(f)) {
          if (ext) {
            if (f.endsWith(`.${ext}`)) {
              files.push(f);
            }
          } else {
            files.push(f);
          }
        }
      });
      return files;
    } else {
      $console.error(`不存在该目录或不是目录:${dir}`);
      return undefined;
    }
  }
  readLocal(path) {
    return this.isFile(path) ? $file.read(path) : undefined;
  }
  readIcloud(path) {
    return this.isFile(path) ? $drive.read(path) : undefined;
  }
  read(path) {
    return this.IS_ICLOUD ? this.readIcloud(path) : this.readLocal;
  }
  write(path, data) {
    return this.IS_ICLOUD
      ? $drive.write({
          data: data,
          path: path
        })
      : $file.write({
          data: data,
          path: path
        });
  }
  absolutePath(path) {
    return this.IS_ICLOUD
      ? $drive.absolutePath(path)
      : $file.absolutePath(path);
  }
  getDirByFile(path) {
    if (this.isDirectory(path)) {
      return path;
    }
    if (this.isFile(path)) {
      const dir_path_end = path.lastIndexOf("/");
      if (dir_path_end >= 0) {
        return path.slice(0, dir_path_end + 1);
      }
    }
    return undefined;
  }
}
class Icloud {
  constructor() {}
  pickFile(handler, types) {
    $drive.open({
      types,
      handler: data => handler(data)
    });
  }
  pickFiles(handler, types) {
    $drive.open({
      multi: true,
      types,
      handler: data => handler(data)
    });
  }
  saveFile(fileName, data, handler) {
    $drive.save({
      name: fileName,
      data,
      handler
    });
  }
  readFile(filePath) {
    return $drive.read(filePath);
  }
  isDirectoryExist(filePath) {
    return $drive.exists(filePath) && $drive.isDirectory(filePath);
  }
  isFileExist(filePath) {
    return $drive.exists(filePath) && !$drive.isDirectory(filePath);
  }
}

class Keychain {
  constructor(domain) {
    this.DOMAIN = domain.toLowerCase();
  }
  get(key) {
    return $keychain.get(key, this.DOMAIN);
  }
  set(key, value) {
    return $keychain.set(key, value, this.DOMAIN);
  }
  getValue(key) {
    return $keychain.get(key, this.DOMAIN);
  }
  setValue(key, value) {
    return $keychain.set(key, value, this.DOMAIN);
  }
  getAll() {
    const keys = $keychain.keys(),
      result = {};
    keys.map(key => {
      result[key] = $keychain.get(key, this.DOMAIN);
    });
    return result;
  }
  remove(key) {
    return $keychain.remove(key, this.DOMAIN);
  }
}

class Prefs {
  constructor() {}
  getData(key) {
    return $prefs.get(key);
  }
  setData(key, value) {
    return $prefs.set(key, value);
  }
  exportData() {
    return $prefs.all();
  }
}

class SQLite {
  constructor(_dataBaseFile) {
    this.DATABASEFILE = _dataBaseFile;
  }
  hasTable(tableId) {
    const result = this.query(`SELECT * FROM ${tableId}`);
    if (result.error) {
      $console.error(result.error);
    }
    return result.error == undefined;
  }
  init() {
    return $sqlite.open(this.DATABASEFILE);
  }
  update(sql, args = undefined) {
    const db = this.init(),
      result = db.update({
        sql: sql,
        args: args
      });
    db.close();
    return result;
  }
  query(sql, args = undefined) {
    const db = this.init(),
      queryResult = db.query({
        sql,
        args
      });
    db.close();
    return queryResult;
  }
  queryAll(tableId) {
    const result = {
        result: undefined,
        error: undefined
      },
      sql = `SELECT * FROM ${tableId}`,
      handler = (rs, err) => {
        if (err == undefined) {
          const queryResultList = [];
          while (rs.next()) {
            queryResultList.push(rs.values);
          }
          result.result = queryResultList;
        } else {
          result.error = err;
          $console.error(err);
        }
        rs.close();
      };
    this.queryHandler(sql, handler);
    return result;
  }
  queryHandler(sql, handler = undefined) {
    this.init().query(sql, handler);
  }
  createSimpleTable(table_id) {
    if (table_id) {
      try {
        const db = this.init(),
          sql = `CREATE TABLE IF NOT EXISTS ${table_id}(id TEXT PRIMARY KEY NOT NULL, value TEXT)`;
        db.update({ sql: sql, args: undefined });
        db.close();
      } catch (error) {
        $console.error(error);
      }
    } else {
      $console.error("createSimpleTable:table_id = undefined");
    }
  }
  parseSimpleQuery(result) {
    try {
      if (result) {
        if (result.error !== null) {
          $console.error(result.error);
          return undefined;
        }
        const sqlResult = result.result,
          data = [];
        while (sqlResult.next()) {
          data.push({
            id: sqlResult.get("id"),
            value: sqlResult.get("value")
          });
        }
        sqlResult.close();
        return data;
      } else {
        return undefined;
      }
    } catch (error) {
      $console.error(`parseSimpleQuery:${error.message}`);
      return undefined;
    }
  }
  parseQueryResult(result) {
    try {
      if (result) {
        if (result.error !== null) {
          $console.error(result.error);
          return undefined;
        }
        const sqlResult = result.result,
          data = [];
        while (sqlResult.next()) {
          data.push(sqlResult.values);
        }
        sqlResult.close();
        return data;
      } else {
        return undefined;
      }
    } catch (error) {
      $console.error(`parseQueryResult:${error.message}`);
      return undefined;
    }
  }
  getSimpleData(table, key) {
    try {
      if (table && key) {
        this.createSimpleTable(table);
        const db = this.init(),
          sql = `SELECT * FROM ${table} WHERE id = ?`,
          args = [key],
          result = db.query({
            sql: sql,
            args: args
          }),
          sql_data = this.parseSimpleQuery(result);
        if (sql_data && sql_data.length === 1) {
          return sql_data[0].value;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } catch (error) {
      $console.error(`getSimpleData:${error.message}`);
      return undefined;
    }
  }
  setSimpleData(table, key, value) {
    try {
      if (table && key) {
        this.createSimpleTable(table);
        const db = this.init(),
          sql = this.getSimpleData(table, key)
            ? `UPDATE ${table} SET value=? WHERE id=?`
            : `INSERT INTO ${table} (value,id) VALUES (?, ?)`,
          args = [value, key],
          update_result = db.update({
            sql: sql,
            args: args
          });
        db.close();
        return update_result.result || false;
      } else {
        return false;
      }
    } catch (error) {
      $console.error(`setSimpleData:${error.message}`);
      return false;
    }
  }
  auto(table, sql_key, value = undefined) {
    this.createSimpleTable(table);
    if (!sql_key || !table) {
      return undefined;
    }
    try {
      if (value) {
        this.setSimpleData(table, sql_key, value.toString());
      }
      return this.getSimpleData(table, sql_key) || undefined;
    } catch (error) {
      $console.error(`SQLite.auto:${error.message}`);
      return undefined;
    }
  }
  getError(sqlResult) {
    return {
      code: sqlResult.code,
      message: sqlResult.localizedDescription
    };
  }
}

module.exports = {
  __VERSION__,
  Cache,
  File,
  Icloud,
  Keychain,
  Prefs,
  SQLite
};
