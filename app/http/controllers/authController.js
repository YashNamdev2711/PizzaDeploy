const User = require('../../models/user');
const bcrypt = require('bcrypt')
const passport = require('passport')
function authController()
{

    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }


    return{
        login (req,res){
            
                res.render('auth/login');
        },
        postLogin(req,res,next){

            const {email,password } = req.body
            //validate request 
            if(  !email || !password)
            {   
                req.flash('error','All fileds are required')
                  
                return res.redirect('/login')
            }


            passport.authenticate('local',(err,user,info)=>{
                if(err)
                {
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }
                req.logIn(user,()=>{
                    if(err){
                    req.flash('error',info.message)
                    return next(err)

                    }
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req,res,next)
        },
        register (req,res){
            
                res.render('auth/register');
        },
      async  postRegister (req,res){
            const {name,email,password } = req.body
            //validate request 
            if(!name || !email || !password)
            {   
                req.flash('error','All fileds are required')
                req.flash('name',name) //when we refresh the page then these fields got sticked w it
                req.flash('email',email) 
                return res.redirect('/register')
            }

            //check if email exist
            User.exists({email : email},(err,result)=>{
                    if(result)
                    {
                        req.flash('error','email already taken Use another')
                        req.flash('name',name)
                        req.flash('email',email)
                        return res.redirect('/register')
                    }
            }) 

            //hash password
            const hashPassword = await bcrypt.hash(password,10)



            //create a user in database
            const user = new User ({
                name:name,
                email:email,
                password:hashPassword
            })
            user.save().then((user)=>{
                //redirect 
                return res.redirect('/');
            }).catch(err=>{
                req.flash('error','something went wrong')
                
                return res.redirect('/register')
            })
             


        },
        logout(req,res){
            req.logout()
            return res.redirect('/login')
        }
    }
}

module.exports = authController;