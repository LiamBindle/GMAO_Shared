function makezdif3 (args)

'numargs  'args
 numargs = result

      name = 'q'
      ptop =  0
       num =  0
while( num < numargs )
       num = num + 1
if( subwrd(args,num)='-q1'    ) ; q1     = subwrd(args,num+1) ; endif
if( subwrd(args,num)='-q2'    ) ; q2     = subwrd(args,num+1) ; endif
if( subwrd(args,num)='-file1' ) ; file1  = subwrd(args,num+1) ; endif
if( subwrd(args,num)='-file2' ) ; file2  = subwrd(args,num+1) ; endif
if( subwrd(args,num)='-name'  ) ; name   = subwrd(args,num+1) ; endif
if( subwrd(args,num)='-ptop'  ) ; ptop   = subwrd(args,num+1) ; endif
endwhile

'run getenv "GEOSUTIL"'
             geosutil = result

* Get Current Environment Settings
* --------------------------------
'getinfo file'
        dfile  = result
'getinfo xpos'
         xpos  = result
'getinfo ypos'
         ypos  = result
'getinfo undef'
         undef = result
'    set undef ' undef

'q gxout'
   gxout = sublin(result,4)
   gxout = subwrd(gxout ,6)

'getinfo zfreq'
         zfreq = result
     if( zfreq = 'varying' )
         'getinfo zmin'
                  zmin = result
         'getinfo zmax'
                  zmax = result
     endif

'getinfo tfreq'
         tfreq = result
     if( tfreq = 'varying' )
        'getinfo tmin'
                 tmin = result
        'getinfo tmax'
                 tmax = result
     endif
     if( tfreq = 'fixed' )
        'getinfo time'
                 tmin = result
                 tmax = result
     endif
     tdim = tmax-tmin+1
'set t 'tmin
'getinfo date'
         timebeg = result
'getinfo tunit'
         tunit = result
     if( tunit = 'year'  ) ; tunit = 'yr'  ; endif
     if( tunit = 'month' ) ; tunit = 'mo'  ; endif
     if( tunit = 'day'   ) ; tunit = 'dy'  ; endif
     if( tunit = 'hour'  ) ; tunit = 'hr'  ; endif
'getinfo tinc'
      timeinc = result''tunit

'set t 'tmin' 'tmax
say 'dfile: 'dfile'  tmin: 'tmin'  tmax: 'tmax'  tdim: 'tdim'  timebeg: 'timebeg'  timeinc: 'timeinc

* Determine Consistent PTOP
* -------------------------
'set dfile 'file1
'getinfo zdim'
         zdim1 = result
'set z  'zdim1
        'getinfo level'
                 level = result
             if( level > ptop ) ; ptop = level ; endif

'set dfile 'file2
'getinfo zdim'
         zdim2 = result
'set z  'zdim2
        'getinfo level'
                 level = result
             if( level > ptop ) ; ptop = level ; endif

say 'PTOP: 'ptop


* Compute Number of Levels in Target Zone
* ---------------------------------------
'set dfile 'file1
'set lev 1000'
'getinfo zpos'
         z1000 = result
'set lev 'ptop
'getinfo zpos'
         zptop = result
      numlevs1 = zptop-z1000 + 1

'set dfile 'file2
'set lev 1000'
'getinfo zpos'
         z1000 = result
'set lev 'ptop
'getinfo zpos'
         zptop = result
      numlevs2 = zptop-z1000 + 1

say 'Number of Levels in File 1 between 1000 and 'ptop' is: 'numlevs1
say 'Number of Levels in File 2 between 1000 and 'ptop' is: 'numlevs2


* Create Array of Target Pressure Levels
* --------------------------------------
'set dfile 'file2

levs = ''
nlev = 0
       z  = 0
       z2 = 1
while( z2<=zdim2 )
      'set z 'z2
      'getinfo level'
               level2 = result
               
         found = 'FALSE'
            z1 = 1
     while( z1<=zdim1 & found = 'FALSE' )
           'set dfile 'file1
           'set z 'z1
           'getinfo level'
                    level = result
                if( level = level2 )
                    found = 'TRUE'
                endif
            z1 = z1 + 1
     endwhile
               
    'set dfile 'file2
    'set z 'z2
     if( found = 'TRUE' )
                     z = z + 1
               level.z = level
           if( level  >= ptop )
                levs    = levs % level.z % " "
                nlev    = nlev + 1
           endif
     endif

z2 = z2 + 1
endwhile

say 'Number of Target Pressure Levels: 'nlev
say '                 Pressure Levels: 'levs
say '                            Name: 'name
say ''


* Create Temporary File at 1x1 degree resolution with consistent levels
* ---------------------------------------------------------------------

'!remove 'name'.data'
'set gxout fwrite'
'set fwrite 'name'.data'

       t = tmin
while( t<= tmax )
 
       i = 1
while( i<= 3 )
       z = 1
while( z<=nlev )
      'set dfile 'file1
      'set t 't
      'set dfile 'file2
      'set lev 'level.z
      'define qobs = 'q2

      'set dfile 'file1
       k = 1
      'set z 'k
      'getinfo level'
               level = result
       while(  level > level.z & k < zdim1 )
               k = k + 1
              'set z 'k
              'getinfo level'
                       level = result
       endwhile

       if( level = level.z )
            'define qmod = 'q1
             if( i = 1 ) ; 'd qmod'      ;endif
             if( i = 2 ) ; 'd qobs'      ;endif
             if( i = 3 ) ; 'd qmod-qobs' ;endif
       endif

z = z + 1
endwhile
i = i + 1
endwhile

t = t + 1
endwhile

'disable fwrite'

'!remove sedfile'
'!remove 'name'.ctl'
'!echo "s@GRADSDATA@"'name'.data@g > sedfile'
'!echo "s@UNDEF@"'undef'@g        >> sedfile'
'!echo "s@ZDIM2@"'nlev'@g         >> sedfile'
'!echo "s@TDIM2@"'tdim'@g         >> sedfile'
'!echo "s@TIMEBEG@"'timebeg'@g    >> sedfile'
'!echo "s@TIMEINC@"'timeinc'@g    >> sedfile'
'!echo "s@LEVS@"'levs'@g          >> sedfile'
'!sed -f  sedfile 'geosutil'/plots/grads_util/zdiff3.template > 'name'.ctl'

say 'Opening: 'name'.ctl'
'open 'name'.ctl'
'getinfo    numfiles'
            newfile = result
'set dfile 'newfile
'set x 1'
'set y 1'
'setz'
'sett'
'define 'name'm    = qm'
'define 'name'o    = qo'
'define 'name'diff = qd'
'q dims'
say 'DIMS: 'result

*'close 'newfile

* Reset Initial Environment Settings
* ----------------------------------
*'set gxout 'gxout
*'set dfile 'dfile
*'set x 'xpos
*'set y 'ypos
*'set z 'zmin' 'zmax
*'set t 'tmin' 'tmax

say 'Finished makezdif3'
return
