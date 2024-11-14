import Image from "next/image";

const CourseCard = () => {
  return (
    <div className="h-[250px] w-full relative flex items-end tablet:rounded group overflow-hidden cursor-pointer">
      <Image
        src="https://i.imgur.com/SVwi47c.jpeg"
        alt="Imagem curso"
        height={1000}
        width={1000}
        className="w-full h-full object-cover absolute -z-50 left-0 top-0 tablet:rounded group-hover:scale-125 transition-all"
      />

      <div className="h-full w-full absolute left-0 top-0 bg-gradient-to-t from-primary to-transparent z-10 tablet:rounded" />

      <div className="flex justify-between text-background p-5 w-full z-50 ">
        <p className="text-semibold">Nome do curso</p>
        <p className="text-semibold">00 hrs</p>
      </div>
    </div>
  );
};

export default CourseCard;
