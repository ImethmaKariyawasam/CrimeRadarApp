type NoticeType = {
  userId: string;
  _id: string;
  type: string;
  name: string;
  age: Number;
  image: String;
  thumbnail: String;
  height: Number;
  weight: Number;
  eye_color: String;
  hair_color: String;
  distinctive_marks: String;
  alias: String;
  description: string;
  missingdate: Date;
  dangerLevel: string;
  isVerified: Boolean;
  location: {
    type: string;
    coordinates: [Number];
  };
};
