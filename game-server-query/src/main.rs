use clap::Parser;
use dotenvy;
use shellexpand;
use std::{collections::HashSet, env, io::Write, path::Path};
// Get list of <game>...server execs
// Run them all at once, since they take forever
// As they return, regex parse them
// Return results to stdout
#[derive(Parser, Debug)]
// #[command(author, version, about, long_about = None)]
struct Args {
    #[arg(short,long,num_args(0..))]
    paths: Option<Vec<String>>,

    #[arg(short,long,num_args(0..))]
    games: Option<Vec<String>>,

    #[arg(long)]
    root_path: Option<String>,
}

fn main() {
    // format!() doesn't work at compile time,
    // Which makes the following impossible:
    // let root_path_key = "ROOT";
    // let env_default_contents: &str = format!("{}=", root_path_key).as_str();
    // So, instead of adding a crate fixing this, just hardcode it instead
    // These 2 vars should be equal ("=" sign aside)
    let root_path_key = "ROOT";
    let env_default_contents = "ROOT=";

    let env_filename = "./env";
    // Ensure env_filename exists
    if !std::path::Path::new(env_filename).exists() {
        let mut f = std::fs::File::create(env_filename).expect("Couldn't create file");
        f.write_all(env_default_contents.as_bytes())
            .expect("Error writing to newly created config file");
    }

    let args = Args::parse();

    // Update root_path, if applicable
    // TODO: Make env file writing robust, right now there is only one config option (root-path)
    if let Some(root_path) = &args.root_path {
        std::fs::File::create(env_filename)
            .expect("Error when creating/opening file")
            .write(format!("{}{}", env_default_contents, root_path).as_bytes())
            .expect("Couldn't write to env file");
    }

    // Root path should be set at this point //

    dotenvy::from_filename(env_filename).expect("Error reading file");
    let root_path_pretilde = env::var(root_path_key).expect("Error when reading root path");
    let root_path = &*shellexpand::tilde(&root_path_pretilde);

    if root_path.is_empty() {
        println!("Please set a root path via: ./game-server-query --root-path");
        std::process::exit(1);
    }

    let mut path_set: HashSet<String> = HashSet::new();

    add_paths(&args, root_path, &mut path_set);

    add_games(&args, root_path, &mut path_set);

    if path_set.len() > 0 {
        for path in path_set {
            println!("{}", path);
        }
    }
    // paths.iter().for_each(|path| println!("{}", path));
    // println!("Hello, world!");
}

fn add_paths(args: &Args, root_path: &str, path_set: &mut HashSet<String>) {
    if let Some(paths) = args.paths.as_ref() {
        let path_set: &mut HashSet<String> = path_set;
        for rel_path in paths {
            let split: Vec<_> = rel_path.split("/").collect();
            if split.len() != 2 {
                panic!(
                    "Expected path of the form <game>/<server>, instead got {}",
                    rel_path
                );
            }
            let path = Path::new(root_path)
                .join(rel_path)
                .to_str()
                .expect("String wasn't Unicode")
                .to_owned();
            path_set.insert(path);
        }
    }
}

fn add_games(args: &Args, root_path: &str, path_set: &mut HashSet<String>) {
    if let Some(games) = args.games.as_ref() {
        let path_set: &mut HashSet<String> = path_set;

        for game in games {
            // println!("{}", game);
            let split: Vec<_> = game.split("/").collect();
            if split.len() != 1 {
                panic!(
                    "Expected game (a string with no slashes), instead got {}",
                    game
                );
            }
            let game_folder = std::fs::read_dir(std::path::Path::new(&root_path).join(game))
                .expect("Error when reading directory");

            for entry in game_folder {
                match entry {
                    Ok(e) if e.path().is_dir() => {
                        let rel_path = e
                            .path()
                            .components()
                            .last()
                            .expect("Error getting server name")
                            .as_os_str()
                            .to_str()
                            .expect("server name somehow wasn't valid unicode")
                            .to_owned();
                        let path = Path::new(root_path)
                            .join(rel_path)
                            .to_str()
                            .expect("String wasn't Unicode")
                            .to_owned();
                        path_set.insert(format!("{}/{}", game, path).to_owned());
                    }
                    Ok(_) => {}
                    Err(e) => eprintln!("Error reading directory: {}", e),
                };
            }
        }
    }
}
