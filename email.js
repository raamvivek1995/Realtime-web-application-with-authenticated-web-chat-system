var shown = false;
function showhideemail(){
        if (shown){
                document.getElementById('email').innerHTML="Show My email";
                shown = false;
        }
        {
        var myemail = "<a href='mail to:manikandanv2"+"@"+"udayton.edu'>manikandanv2" + "@" + "udayton.edu</a>";
        document.getElementById('email').innerHTML= myemail;
        shown = true;
}
}
