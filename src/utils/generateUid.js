export const generateUid = (length) => {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uid =  ''
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        uid += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return uid
  }