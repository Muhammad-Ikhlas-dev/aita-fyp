import robot from "../assets/robo.png";
import glow from "../assets/glow.png";
import Button from "./Button";

export default function Hero() {
  return (
    <section className="
      relative min-h-screen w-full
      flex justify-start sm:justify-center items-start sm:items-center
      pt-10 sm:pt-0
      bg-gradient-to-b from-[#0a001a] via-[#1a0033] to-[#0f0020]
      overflow-hidden
    ">

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="
            w-[450px] h-[450px]
            sm:w-[650px] sm:h-[650px]
            md:w-[800px] md:h-[800px]
            lg:w-[1100px] lg:h-[1100px]
            bg-purple-600/30 rounded-full blur-3xl animate-pulse opacity-70
          "
        />
      </div>



      {/* CENTER CONTENT */}
      <div className="
        relative w-full px-4 sm:px-6 md:px-8
        flex flex-col items-center justify-start sm:justify-center
        mt-10 sm:mt-0
        pb-[240px] sm:pb-0
      ">

        {/* ✅ GLOW IMAGE BEHIND ROBOT */}
        <img
          src={glow}
          alt="Glow effect"
          className="
            absolute z-10 pointer-events-none select-none
            w-[300px]
            sm:w-[420px]
            md:w-[520px]
            lg:w-[720px]
            xl:w-[880px]
          "
        />

        {/* Robot */}
        <img
          src={robot}
          alt="AI Teacher Assistant Robot"
          className="
            relative z-20 w-full object-contain drop-shadow-2xl
            max-w-[260px]
            sm:max-w-[420px]
            md:max-w-[560px]
            lg:max-w-[900px]
            xl:max-w-[1100px]
          "
          style={{ maxHeight: "85vh" }}
        />



        {/* Headings */}
        <div className="absolute inset-0 flex flex-col items-center justify-start sm:justify-center text-center pointer-events-none">

          {/* Tag */}
          <p
            className="
              absolute
              top-0 left-4 
              sm:top-10 sm:left-10
              md:top-14 md:left-14
              lg:top-20 lg:left-20
              text-white text-xs sm:text-sm md:text-base tracking-widest
            "
          >
            Robot Intelligence
          </p>

          <h2 className="
            text-white/35 font-black tracking-widest
            text-lg sm:text-3xl md:text-4xl lg:text-6xl xl:text-6xl
            mt-12 sm:mt-0
            mb-2 md:mb-4 z-10
          ">
            EMPOWERING MINDS WITH
          </h2>

          <h1 className="
            text-white font-black tracking-tight leading-none drop-shadow-2xl z-20
            text-2xl sm:text-6xl md:text-7xl lg:text-[10rem] xl:text-[6rem]
          ">
            AI TEACHER ASSESTENCE
          </h1>

          <h2 className="
            text-white/35 font-black tracking-widest
            text-md sm:text-3xl md:text-4xl lg:text-6xl xl:text-6xl
            mt-2 md:mt-4 z-10
          ">
            TOMORROWS INTELLIGENCE
          </h2>

        </div>
      </div>



      {/* ================= MOBILE STACK ================= */}
      <div className="
        absolute bottom-4 left-0 w-full
        flex flex-col items-center gap-4 px-4
        sm:hidden z-40
      ">

        <div className="w-full max-w-md bg-black/20 backdrop-blur-md rounded-xl p-4">
          <p className="text-white/90 text-xs leading-relaxed mb-4">
            AI teacher tool that makes daily tasks simple and smart.
            It manages plans, grades, and helps save hours each week.
            Instant feedback, custom lessons made with just one click.
            Teaching made easy—less stress, more time to inspire minds.
          </p>
          <Button text={"Access Now"} />
        </div>

        <div className="w-full max-w-md bg-black/20 backdrop-blur-md rounded-xl p-4">
          <p className="text-white font-bold text-sm mb-2">
            NEW TECHNOLOGY
          </p>

          <p className="text-white/90 text-xs leading-relaxed">
            AI teaching tools now redefine classroom efficiency.
            A digital guide built to support teachers and save time.
            Smart grading, lesson planning, feedback with ease.
            Intelligent systems enhancing how students learn.
          </p>
        </div>
      </div>



      {/* ================= DESKTOP LEFT ================= */}
      <div className="
        hidden sm:block absolute left-0 w-full max-w-xl
        bottom-[6%] md:bottom-[5%] lg:bottom-[2%]
        pl-8 md:pl-14 lg:pl-20
        z-40
      ">
        <div className="max-w-md bg-black/20 backdrop-blur-md rounded-xl p-5 md:p-6">
          <p className="text-white/90 text-sm md:text-base leading-relaxed mb-5">
            AI teacher tool that makes daily tasks simple and smart.
            It manages plans, grades, and helps save hours each week.
            Instant feedback, custom lessons made with just one click.
            Teaching made easy—less stress, more time to inspire minds.
          </p>
          <Button text={"Access Now"} />
        </div>
      </div>



      {/* ================= DESKTOP RIGHT ================= */}
      <div className="
        hidden sm:block absolute right-0 w-full max-w-xl
        bottom-[6%] md:bottom-[5%] lg:bottom-[2%]
        pr-8 md:pr-14 lg:pr-20
        z-40
      ">
        <div className="max-w-md ml-auto bg-black/20 backdrop-blur-md rounded-xl p-5 md:p-6">
          <p className="text-white font-bold text-lg md:text-2xl lg:text-4xl mb-3">
            NEW TECHNOLOGY
          </p>
          <p className="text-white/90 text-sm md:text-base leading-relaxed">
            AI teaching tools now redefine classroom efficiency.
            A digital guide built to support teachers and save time.
            Smart grading, lesson planning, feedback with ease.
            Intelligent systems enhancing how students learn.
          </p>
        </div>
      </div>

    </section>
  );
}
