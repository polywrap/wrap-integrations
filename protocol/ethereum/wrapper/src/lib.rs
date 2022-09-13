pub mod wrap;
pub use wrap::*;
pub mod mapping;
pub use mapping::*;
pub mod resolvers;
pub use resolvers::*;
pub mod utils;
pub use utils::*;

use core::num::NonZeroU32;
use getrandom::{register_custom_getrandom, Error};

const MY_CUSTOM_ERROR_CODE: u32 = Error::CUSTOM_START + 42;
pub fn always_fail(buf: &mut [u8]) -> Result<(), Error> {
    let code = NonZeroU32::new(MY_CUSTOM_ERROR_CODE).unwrap();
    Err(Error::from(code))
}

register_custom_getrandom!(always_fail);
