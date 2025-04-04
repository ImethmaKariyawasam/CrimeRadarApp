import React from "react";
import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import { BsFacebook } from "react-icons/bs";
import { BsLinkedin } from "react-icons/bs";
import { BsGithub } from "react-icons/bs";
export default function FooterComp() {
  return (
    <Footer container className="border border-t-8 border-teal-500">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid w-full justify-between sm:flex md:grid-cols-1">

          <div className="mt-5">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white"
            >
              <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
                Crime
              </span>
              Radar
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
            <Footer.Title title="Important Links"/>
            <Footer.LinkGroup col>
                <Footer.Link
                href='/contact-us'
                target="_blank"
                rel='noopener noreferrer'
                >
                Contact Us
                </Footer.Link>
                <Footer.Link
                href='/about-us'
                target="_blank"
                rel='noopener noreferrer'
                >
                About Us
                </Footer.Link>
                <Footer.Link
                href='https://cmj.sljol.info/'
                target="_blank"
                rel='noopener noreferrer'
                >
                Top Medical Journels
                </Footer.Link>
            </Footer.LinkGroup>
            </div>

            <div>
            <Footer.Title title="Follow us"/>
            <Footer.LinkGroup col>
                <Footer.Link
                href='https://github.com/it22323934/'
                target="_blank"
                rel='noopener noreferrer'
                >
                Github
                </Footer.Link>
                <Footer.Link
                href='#'
                target="_blank"
                rel='noopener noreferrer'
                >
                Discord
                </Footer.Link>
            </Footer.LinkGroup>
            </div>

            <div>
            <Footer.Title title="Legal"/>
            <Footer.LinkGroup col>
                <Footer.Link
                href='#'
                target="_blank"
                rel='noopener noreferrer'
                >
                Privacy policy
                </Footer.Link>
                <Footer.Link
                href='#'
                target="_blank"
                rel='noopener noreferrer'
                >
                Terms and conditions
                </Footer.Link>
            </Footer.LinkGroup>
            </div>

          </div>

        </div>
        <Footer.Divider/>
        <div className="w-full sm:flex sm:items-center sm:justify-between">
            <Footer.Copyright href="#" by="Team WebTitans" year={new Date().getFullYear()}/>
            <div className=" flex gap-6 sm:mt-0 mt-4 sm:justify-center">
                <Footer.Icon href='https://www.linkedin.com/in/asiri-jayawardena-5707a3282?originalSubdomain=lk' icon={BsLinkedin} />
                <Footer.Icon href='https://github.com/it22323934/' icon={BsGithub} />
            </div>
        </div>
      </div>
    </Footer>
  );
}
