import Array "mo:core/Array";
import Iter "mo:core/Iter";

actor {
  type ContactSubmission = {
    name : Text;
    email : Text;
    message : Text;
  };

  var submissions : [ContactSubmission] = [];

  public shared ({ caller }) func submitContactForm(name : Text, email : Text, message : Text) : async () {
    let newSubmission : ContactSubmission = {
      name;
      email;
      message;
    };
    submissions := submissions.concat([newSubmission]);
  };

  public query ({ caller }) func getAllSubmissions() : async [ContactSubmission] {
    submissions;
  };
};
