import { User } from './types/user';

export function downloadFile(jsonData: Array<any>, filename = 'data'): string {
  let csvData = convertToCSV(jsonData, [
    'firstName',
    'lastName',
    'username',
    'email',
  ]);
  console.log(csvData);
  let blob = new Blob(['\ufeff' + csvData], {
    type: 'text/csv;charset=utf-8;',
  });
  return URL.createObjectURL(blob);
}

export function convertToCSV(objArray: Array<any>, headerList: Array<string>) {
  let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  let row = 'S.No,';

  for (let index in headerList) {
    row += headerList[index] + ',';
  }
  row = row.slice(0, -1);
  str += row + '\r\n';
  for (let i = 0; i < array.length; i++) {
    let line = i + 1 + '';
    for (let index in headerList) {
      let head = headerList[index];
      line += ',' + array[i][head];
    }
    str += line + '\r\n';
  }
  return str;
}

export function parseCsvToUsers(csv: string): User[] {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const users: User[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const user: Partial<User> = {};
    header.forEach((key, idx) => {
      if (key === 'firstname') user.firstName = values[idx];
      if (key === 'lastname') user.lastName = values[idx];
      if (key === 'username') user.username = values[idx];
      if (key === 'email') user.email = values[idx];
    });
    // Only add if all required fields are present
    if (user.firstName && user.lastName && user.username && user.email) {
      users.push(user as User);
    }
  }
  console.log(users);
  return users;
}
