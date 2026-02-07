const jwt = require("jsonwebtoken")
const {randomBytes} = require("crypto")
const {promisify} = require("util")
const path = require("path")

const User = require("@model/user")

// IN JWT, USED A HYBRID TECHNIQUE, IN WHICH LONG TERM AND SHORT TERM TOKEN ARE UTILIZED
// AND EVERY SAME ACCOUNT ON MULTIPLE DEVICE UTILIZE SAME TOKEN 
// WHEN ANY DEVICE LOGOUT, ALL OTHER HAVE TO LOGOUT
// ALL DEVICE WILL USE SAME TOKEN WHICH FIRST DEVICE ON LOGIN RECEIVED
async function createSessionCookie(userData, sessionToken) {
    const randomBytePromise = promisify(randomBytes)
    sessionToken = sessionToken ?? (await randomBytePromise(10)).toString('hex')
    
    const payload = {
        userData: {
            id: userData._id,
            email: userData.email,
            name: userData.name,
            role: userData.role
        },
        sessionTime: Date.now(),
        sessionToken,
    };
    const jwtSign = promisify(jwt.sign)
    const token = await jwtSign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_MAIN_EXPIRY })
    return { sessionCookie: token, sessionToken };
}

// 1. Decode JWT token and verify if the token is expired or not
// 2. Verify time Value -> If statement for Time Value (yes: continue with, no: search in DB to verify)
//      if yes: return userData, if no: search in DB to verify refreshToken
// 3. if verify from DB, now update the sessionToken cookie with new sessionTime by creating new session token
// 4. then create new Cookie
// 4. RETURN userData and sessionCookie
async function verifyToken(sessionCookie){
    // 1
    const decoded = jwt.verify(sessionCookie,process.env.JWT_SECRET)
    if(!(decoded && decoded.userData)) throw new Error("session is expired, login again")
    // 2
    if(decoded.sessionTime && String(decoded.sessionTime) < (Date.now() + process.env.JWT_SESSION_EXPIRY)) return {userData: decoded.userData, sessionToken: null}
    // Session time is expired
    const user = await User.findById(decoded?.userData.id).select("sessionToken")
    if(!user) throw new Error("user not found, login again")
    else if(user.sessionToken && user.sessionToken !== decoded.sessionToken) throw new Error("session verification failed, login again")
    // 3 
    user.sessionTime = Date.now()
    await user.save()
        .catch((error)=>{
            throw new Error(error)
        })
    // 4
    ({sessionCookie} = await createSessionCookie({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
    }, null))
    return {userData: decoded.userData, sessionCookie}
}

module.exports = {
    verifyToken,
    createSessionCookie
}