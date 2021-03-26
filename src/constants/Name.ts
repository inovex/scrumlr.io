export interface Name {
  A: string[];
  B: string[];
  C: string[];
  D: string[];
  E: string[];
  F: string[];
  G: string[];
  H: string[];
  K: string[];
  L: string[];
  M: string[];
  O: string[];
  P: string[];
  R: string[];
  S: string[];
  T: string[];
  W: string[];
  Z: string[];
}


export const ANIMAL_NAMES: Name = {
    A: ['Alligator', 'Alpaca', 'Antelope', 'Ape'],
    B: ['Bat', 'Bear', 'Beaver', 'Bee', 'Bird', 'Butterfly'],
    C: ['Camel', 'Cat', 'Chicken', 'Coyote', 'Crow'],
    D: ['Deer', 'Dinosaur', 'Dog', 'Dolphin', 'Donkey', 'Duck'],
    E: ['Eagle', 'Elephant', 'Emu'],
    F: ['Falcon', 'Fish', 'Flamingo', 'Fly', 'Frog'],
    G: ['Giraffe', 'Goat', 'Goose', 'Gorilla', 'Grasshopper'],
    H: ['Hamster', 'Hedgehog', 'Hornet', 'Horse'],
    K: ['Koala', 'Kangaroo'],
    L: ['Leopard', 'Lion', 'Llama'],
    M: ['Mole', 'Monkey', 'Moose', 'Mouse', 'Mule'],
    O: ['Opossum', 'Owl'],
    P: ['Panda', 'Parrot', 'Penguin', 'Pig', 'Pigeon'],
    R: ['Rabbit', 'Raccoon', 'Rat', 'Raven', 'Reindeer'],
    S: [
      'Seal',
      'Seastar',
      'Shark',
      'Sheep',
      'Skunk',
      'Snake',
      'Spider',
      'Squirrel',
      'Swan'
    ],
    T: ['Termite', 'Tiger', 'Turkey', 'Turtle'],
    W: ['Walrus', 'Wasp', 'Weasel', 'Whale', 'Wolf', 'Wombat'],
    Z: ['Zebra']
  };


  
  export const ADJECTIVES: Name = {
    A: [
      'Adorable',
      'Adventurous',
      'Acrobatic',
      'Afraid',
      'Aggressive',
      'Agile',
      'Amazing',
      'Angry',
      'Anxious',
      'Ashamed',
      'Awesome',
      'Awful',
      'Awkward'
    ],
    B: [
      'Bad',
      'Beautiful',
      'Beloved',
      'Best',
      'Black',
      'Bold',
      'Brave',
      'Brilliant',
      'Busy'
    ],
    C: [
      'Calm',
      'Charming',
      'Cheap',
      'Cold',
      'Concerned',
      'Cool',
      'Crazy',
      'Creative',
      'Critical',
      'Curly',
      'Cute'
    ],
    D: [
      'Dangerous',
      'Dark',
      'Deadly',
      'Delicious',
      'Difficult',
      'Direct',
      'Dirty',
      'Dizzy'
    ],
    E: ['Eager', 'Educated', 'Elegant', 'Excellent', 'Excited'],
    F: [
      'Fabulous',
      'Fake',
      'Fast',
      'Fearless',
      'Focused',
      'Foolish',
      'Fresh',
      'Funky',
      'Funny'
    ],
    G: ['Giant', 'Gifted', 'Good', 'Grand', 'Great', 'Grown', 'Grumpy'],
    H: ['Hairy', 'Handsome', 'Happy', 'Heavy', 'Hot', 'Huge'],
    K: ['Keen', 'Kind'],
    L: ['Lame', 'Large', 'Lazy', 'Lean', 'Little', 'Lonely', 'Lovely', 'Loyal'],
    M: ['Mad', 'Majestic', 'Major', 'Massive', 'Mean', 'Modern', 'Mysterious'],
    O: ['Oily', 'Odd', 'Old', 'Optimistic', 'Ordinary', 'Outstanding'],
    P: [
      'Pale',
      'Peaceful',
      'Perfect',
      'Phony',
      'Pink',
      'Polite',
      'Poor',
      'Positive',
      'Pretty',
      'Proud'
    ],
    R: ['Rare', 'Raw', 'Reckless', 'Remote', 'Rich', 'Rough', 'Royal', 'Rude'],
    S: [
      'Sad',
      'Sarcastic',
      'Scared',
      'Scary',
      'Secret',
      'Sexy',
      'Shiny',
      'Silly',
      'Sour',
      'Spicy',
      'Strong',
      'Stylish',
      'Super',
      'Suspicious'
    ],
    T: ['Tasty', 'Tempting', 'Terrible', 'Thin', 'Tiny', 'Tough', 'Twin'],
    W: [
      'Wealthy',
      'Weak',
      'Weird',
      'Wet',
      'White',
      'Wicked',
      'Wild',
      'Wise',
      'Worst'
    ],
    Z: ['Zany', 'Zealous', 'Zigzag']
  };
  
  export const getRandomName = () => {
    const keys = Object.keys(ANIMAL_NAMES);
    const randomKey = keys[(keys.length * Math.random()) << 0];

    const randomAnimal =
      ANIMAL_NAMES[randomKey][
        (ANIMAL_NAMES[randomKey].length * Math.random()) << 0
      ];
    const randomAdjective =
      ADJECTIVES[randomKey][(ADJECTIVES[randomKey].length * Math.random()) << 0];
  
    return `${randomAdjective} ${randomAnimal}`;
  };

  export const getInitials = (name: string): string => {
    return name.split(' ')
      .map(n => n[0])
      .join('');
  }
  
  export default getRandomName;